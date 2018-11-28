<template>
  <div class="animated fadeIn">
    <img
      class="animated zoomOutUp delay-2s"
      v-bind:src="sample"
    >
    <br>
    <input
      id="plop"
      type="text"
    >
    <button v-on:click="submitInput()">CHAT</button>
    <br>
    <h2 id="blah"></h2>
  </div>
</template>

<script>
import { Display } from "rot-js";
import SocketIo from "socket.io-client";

const io = SocketIo();

io.on("chat message", msg => {
  const h2 = document.createElement("h2");
  h2.innerHTML = `${msg.user} says: ${msg.message}`;
  document.body.appendChild(h2);
});

export default {
  data() {
    return {
      message: "Welcome to example component",
      sample: require("./../assets/moonwhale.png")
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
    // if (!document.getElementById("rot")) {
    //   let o = {
    //     width: 11,
    //     height: 5
    //   };
    //   let d = new Display(o);
    //   const abc = document.body.appendChild(d.getContainer());
    //   abc.id = "rot";

    //   for (let i = 0; i < o.width; i++) {
    //     for (let j = 0; j < o.height; j++) {
    //       if (!i || !j || i + 1 == o.width || j + 1 == o.height) {
    //         d.draw(i, j, "#", "gray");
    //       } else {
    //         d.draw(i, j, ".", "#666");
    //       }
    //     }
    //   }
    //   d.draw(o.width >> 1, o.height >> 1, "@", "goldenrod");
    // }
  }
};
</script>