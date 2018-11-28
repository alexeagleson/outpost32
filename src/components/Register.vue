<template>
  <div class="row animated fadeIn">
    <div class="col-2 col-md-3 col-lg-5"></div>
    <div class="col-8 col-md-6 col-lg-2">
      <form>
        <div class="form-group">
          <label for="login-username">Username</label>
          <input
            type="text"
            class="form-control"
            id="login-username"
            placeholder="username"
            v-model="username"
            required
            autofocus
          >
        </div>
        <div class="form-group">
          <label for="login-password">Password</label>
          <input
            type="password"
            class="form-control"
            id="login-password"
            placeholder="password"
            v-model="password"
            required
          >
        </div>
        <small
          v-if="error"
          class="form-text text-muted"
        >{{error}}</small>
        <button
          type="submit"
          class="btn btn-outline-info"
          v-on:click="handleSubmit"
        >Register</button>

      </form>
    </div>
    <div class="col-2 col-md-3 col-lg-5"></div>
  </div>
</template>

<script>
export default {
  props: ["nextUrl"],
  data() {
    return {
      username: "",
      password: "",
      error: ""
    };
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault();
      if (this.password.length > 0) {
        let url = "/register";
        this.$http
          .post(url, {
            username: this.username,
            password: this.password
          })
          .then(response => {
            if (response.data.error) {
              this.error = response.data.error;
              return;
            }

            this.error = "";
            localStorage.setItem("user", response.data.username);
            localStorage.setItem("jwt", response.data.token);

            if (localStorage.getItem("jwt") != null) {
              this.$emit("loggedIn");
              if (this.$route.params.nextUrl != null) {
                this.$router.push(this.$route.params.nextUrl);
              } else {
                this.$router.push("/");
              }
            }
          })
          .catch(error => {
            console.error(error);
          });
      } else {
        return alert("You need a password");
      }
    }
  }
};
</script>

<style scoped>
.row {
  padding-top: 40px;
}

button {
  display: block;
  margin: auto;
  margin-top: 40px;
  width: 50%;
}
</style>