<template>
  <div>
    <div class="row animated fadeIn">
      <div class="col-2 col-md-3 col-lg-5"></div>
      <div class="col-8 col-md-6 col-lg-2">
        <button v-on:click="moveUp()">UP</button>
        <button v-on:click="moveDown()">DOWN</button>
        <button v-on:click="moveLeft()">LEFT</button>
        <button v-on:click="moveRight()">RIGHT</button>
      </div>
      <div class="col-2 col-md-3 col-lg-5"></div>
    </div>
    <div class="row" id="rot-container"></div>
  </div>
</template>

<script>
import { Display } from "rot-js";
import SocketIo from "socket.io-client";

const io = SocketIo({ query: `user=${localStorage.getItem("user")}` });

const keydownHandler = keyboardEvent => {
  if (keyboardEvent.key === "w") {
    io.emit("move", { x: 0, y: -1 });
  } else if (keyboardEvent.key === "s") {
    io.emit("move", { x: 0, y: 1 });
  } else if (keyboardEvent.key === "a") {
    io.emit("move", { x: -1, y: 0 });
  } else if (keyboardEvent.key === "d") {
    io.emit("move", { x: 1, y: 0 });
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
    moveUp() {
      io.emit("move", { x: 0, y: -1 });
    },
    moveDown() {
      io.emit("move", { x: 0, y: 1 });
    },
    moveLeft() {
      io.emit("move", { x: -1, y: 0 });
    },
    moveRight() {
      io.emit("move", { x: 1, y: 0 });
    },
  },
  mounted() {
    window.addEventListener("keydown", keydownHandler);

    io.emit("map", {});

    io.on("map", world => {
      if (!this.rotDisplay) {
        this.world = world;
        const rotContainer = document.getElementById("rot-container");

        this.rotDisplay = new Display(this.world);

        rotContainer.appendChild(this.rotDisplay.getContainer());

        rotContainer.className = "animated fadeIn";
        // this.rotDisplay.getContainer().style.width = '100%';
      }

      for (let i = 0; i < this.world.width; i++) {
        for (let j = 0; j < this.world.height; j++) {
          this.rotDisplay.draw(i, j, this.world.tileMap[`${i},${j}`], "gray");
        }
      }
    });

    io.on("moveOk", players => {
      for (let i = 0; i < this.world.width; i++) {
        for (let j = 0; j < this.world.height; j++) {
          this.rotDisplay.draw(i, j, this.world.tileMap[`${i},${j}`], "gray");
        }
      }
      players.forEach((player) => {
        this.rotDisplay.draw(player.x, player.y, "@", "yellow");
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