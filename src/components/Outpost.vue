<template>
  <div>
    <div class="row animated fadeIn">
      <div class="col-2 col-md-3 col-lg-5"></div>
      <div class="col-8 col-md-6 col-lg-2"></div>
      <div class="col-2 col-md-3 col-lg-5"></div>
    </div>
    <div
      class="row"
      id="rot-container"
    ></div>
    <p class="strokeme" v-if="show" v-bind:style="{ position: 'absolute', left: xPos, top: yPos }">{{ message }}</p>
  </div>
</template>

<script>
import { Display } from 'rot-js';
import SocketIo from 'socket.io-client';

import Camera from './display-utility/Camera';
import Font from './display-utility/Font';
import Screen from './display-utility/Screen';

let io = null;

const keydownHandler = keyboardEvent => {
  if (!io) return false;
  if (keyboardEvent.key === 'w') {
    io.emit('move', { dx: 0, dy: -1 });
  } else if (keyboardEvent.key === 's') {
    io.emit('move', { dx: 0, dy: 1 });
  } else if (keyboardEvent.key === 'a') {
    io.emit('move', { dx: -1, dy: 0 });
  } else if (keyboardEvent.key === 'd') {
    io.emit('move', { dx: 1, dy: 0 });
  }
};

export default {
  data() {
    return {
      message: 'butt',
      rotDisplay: null,
      worldMap: null,
      xPos: '0px',
      yPos: '0px',
      show: false,
      camera: null,
      readyToRender: false,
    };
  },
  methods: {
    drawOne(coords) {
      const screenCoords = this.camera.actualToScreen(coords);
      if (!this.camera.withinCameraBounds(screenCoords)) return;
      const key = `${coords[0]},${coords[1]}`;
      this.rotDisplay.draw(screenCoords[0], screenCoords[1], this.worldMap.tileMap[key].char, Font[this.worldMap.tileMap[key].fgColour]);
    },
    drawAll() {
      for (let i = 0; i < Screen.MAIN_DISPLAY_TILE_WIDTH; i += 1) {
        for (let j = 0; j < Screen.MAIN_DISPLAY_TILE_HEIGHT; j += 1) {
          const actualCoords = this.camera.screenToActual([i, j]);
          const key = `${actualCoords[0]},${actualCoords[1]}`
          const char = this.worldMap.tileMap[key] ? this.worldMap.tileMap[key].char : ' ';
          const fgColour = this.worldMap.tileMap[key] ? this.worldMap.tileMap[key].fgColour : Font.WHITE;
          this.rotDisplay.draw(i, j, char, Font[fgColour]);
        }
      }
    },
  },
  mounted() {
    io = SocketIo({ query: `user=${localStorage.getItem('user')}` });

    window.addEventListener('keydown', keydownHandler);
    this.camera = new Camera(Screen.MAIN_DISPLAY_TILE_WIDTH, Screen.MAIN_DISPLAY_TILE_HEIGHT, Font.FONT_SIZE);

    io.emit('sendMap', {});

    io.on('sendMap', worldMap => {
      if (!this.rotDisplay) {
        this.worldMap = worldMap;
        const rotContainer = document.getElementById('rot-container');
        this.rotDisplay = new Display({
          width: Screen.MAIN_DISPLAY_TILE_WIDTH,
          height: Screen.MAIN_DISPLAY_TILE_HEIGHT,
          fg: Font.WHITE,
          bg: Font.BLACK,
          fontSize: Font.FONT_SIZE,
          forceSquareRatio: true,
          fontFamily: Font.FONT_FAMILY,
        });
        rotContainer.appendChild(this.rotDisplay.getContainer());
        this.rotDisplay.getContainer().addEventListener('mousemove', e => {
          this.xPos = e.x + 'px';
          this.yPos = e.y + 'px';
          this.show = false;
          const hoverCoords = this.camera.screenToActual(this.camera.pixelToTile([e.offsetX, e.offsetY]));
          io.emit('whatsThis', hoverCoords);
        });
        rotContainer.className = 'animated fadeIn';
        this.readyToRender = true;
        this.drawAll();
      }
    });

    io.on('updateTile', tileRender => {
      if (!this.readyToRender) return;
      this.worldMap.tileMap[`${tileRender.x},${tileRender.y}`] = tileRender;
      this.drawOne([tileRender.x, tileRender.y]);
    });

    io.on('updateCamera', newCameraPosition => {
      if (!this.readyToRender) return;
      this.camera.updatePosition(newCameraPosition, this.worldMap);
      this.drawAll();
    });
  },
  destroyed() {
    if (io) io.close();
    window.removeEventListener('keydown', keydownHandler);
  },
};
</script>

<style scoped>
#rot-container {
  display: flex;
  justify-content: center;
}

.strokeme {
  color: white;
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
}
</style>