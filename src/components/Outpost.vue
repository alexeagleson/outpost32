<template>
  <div>
    <div class="row animated fadeIn">
      <div class="col-2 col-md-3 col-lg-5"></div>
      <div class="col-8 col-md-6 col-lg-2"></div>
      <div class="col-2 col-md-3 col-lg-5"></div>
    </div>
    <div class="row" id="rot-container"></div>
  </div>
</template>

<script>
import { Display } from "rot-js";
import SocketIo from "socket.io-client";

const CANVAS_SIZE = 0.75;
const ROT_FONT_SIZE = 20;

const SCREEN_WIDTH = Math.floor((window.innerWidth * CANVAS_SIZE) / ROT_FONT_SIZE) * ROT_FONT_SIZE;
const SCREEN_HEIGHT = Math.floor((window.innerHeight * CANVAS_SIZE) / ROT_FONT_SIZE) * ROT_FONT_SIZE;
const MAIN_DISPLAY_TILE_WIDTH = Math.floor(SCREEN_WIDTH / ROT_FONT_SIZE);
const MAIN_DISPLAY_TILE_HEIGHT = Math.floor(SCREEN_HEIGHT / ROT_FONT_SIZE);

const HEX_WHITE = "#ABB2BF";
const HEX_BLACK = "#262626";
const HEX_RED = "#FF4C4C";
const HEX_YELLOW = "#FFE272";
const HEX_BLUE = "#56b6c2";
const HEX_GREEN = "#98c379";
const HEX_ORANGE = "#FF9900";
const HEX_GREY = "#666666";
const FONT_FAMILY = "dejavu sans mono, consolas, monospace";

const io = SocketIo({ query: `user=${localStorage.getItem("user")}` });

const keydownHandler = keyboardEvent => {
  if (keyboardEvent.key === "w") {
    io.emit("move", { dx: 0, dy: -1 });
  } else if (keyboardEvent.key === "s") {
    io.emit("move", { dx: 0, dy: 1 });
  } else if (keyboardEvent.key === "a") {
    io.emit("move", { dx: -1, dy: 0 });
  } else if (keyboardEvent.key === "d") {
    io.emit("move", { dx: 1, dy: 0 });
  }
};

export default {
  data() {
    return {
      message: "Welcome to example component",
      rotDisplay: null,
      world: null,
    };
  },
  methods: {
  },
  mounted() {
    window.addEventListener("keydown", keydownHandler);

    io.emit("map", {});

    io.on("map", world => {
      if (!this.rotDisplay) {
          console.log(world.tileMap);
        this.world = world;
        const rotContainer = document.getElementById("rot-container");
        this.rotDisplay = new Display({
          width: MAIN_DISPLAY_TILE_WIDTH,
          height: MAIN_DISPLAY_TILE_HEIGHT,
          fg: HEX_WHITE,
          bg: HEX_BLACK,
          fontSize: ROT_FONT_SIZE,
          forceSquareRatio: true,
          fontFamily: FONT_FAMILY,
        });
        rotContainer.appendChild(this.rotDisplay.getContainer());
        rotContainer.className = "animated fadeIn";
      }
    });

    io.on("moveOk", tiles => {
      for (let i = 0; i < this.world.mapWidth; i++) {
        for (let j = 0; j < this.world.mapHeight; j++) {
          this.rotDisplay.draw(i, j, this.world.tileMap[`${i},${j}`].char, HEX_WHITE);
        }
      }
      tiles.forEach((player) => {
        this.rotDisplay.draw(player.x, player.y, "@", HEX_RED);
      });
    });
  },
  destroyed() {
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