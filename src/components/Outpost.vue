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
      message: 'Welcome to example component',
      rotDisplay: null,
      world: null,
    };
  },
  methods: {},
  mounted() {
    io = SocketIo({ query: `user=${localStorage.getItem('user')}` });

    window.addEventListener('keydown', keydownHandler);
    const camera = new Camera(Screen.MAIN_DISPLAY_TILE_WIDTH, Screen.MAIN_DISPLAY_TILE_HEIGHT);

    io.emit('map', {});

    io.on('map', world => {
      if (!this.rotDisplay) {
        console.log(world.tileMap);
        this.world = world;
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
        rotContainer.className = 'animated fadeIn';
      }
    });

    io.on('drawThis', drawObject => {
      this.rotDisplay.draw(drawObject.x, drawObject.y, drawObject.char, Font[drawObject.colour]);
    });

    io.on('moveOk', playersDrawInfo => {
      const myPlayer = playersDrawInfo.find(playerInfo => playerInfo.socketId === io.id);

      camera.updatePosition(myPlayer, this.world);

      for (let i = 0; i < Screen.MAIN_DISPLAY_TILE_WIDTH; i++) {
        for (let j = 0; j < Screen.MAIN_DISPLAY_TILE_HEIGHT; j++) {
          const coords = camera.screenToActual([i, j]);
          const char = this.world.tileMap[`${coords[0]},${coords[1]}`]
            ? this.world.tileMap[`${coords[0]},${coords[1]}`].char
            : ' ';
          this.rotDisplay.draw(i, j, char, Font.WHITE);
        }
      }

      playersDrawInfo.forEach(drawInfo => {
        const coords = camera.actualToScreen([drawInfo.x, drawInfo.y]);
        this.rotDisplay.draw(coords[0], coords[1], drawInfo.char, Font[drawInfo.colour]);
      });
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
</style>