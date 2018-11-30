<template>
  <div class="row animated fadeIn">
    <div class="col-2 col-md-3 col-lg-5"></div>
    <div class="col-8 col-md-6 col-lg-2">
      <input
        id="plop"
        type="text"
      >
      <button v-on:click="submitInput()">CHAT</button>
      <div id="rot-container"></div>
      <div id="chat"></div>
    </div>
    <div class="col-2 col-md-3 col-lg-5"></div>

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
    submitInput() {
      const d = document.getElementById("plop");
      io.emit("chat message", {
        user: localStorage.getItem("user"),
        message: d.value
      });
      d.value = "";
    }
  },
  mounted() {
    io.on("chat message", msg => {
      const h2 = document.createElement("h2");
      h2.innerHTML = `${msg.user} says: ${msg.message}`;
      document.getElementById("chat").appendChild(h2);
    });

    window.addEventListener("keydown", keydownHandler);

    io.on("map", world => {
      if (!this.rotDisplay) {
        this.world = world;
        const rotContainer = document.getElementById("rot-container");

        this.rotDisplay = new Display(this.world);

        rotContainer.appendChild(this.rotDisplay.getContainer());

        rotContainer.className = "animated fadeIn";
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