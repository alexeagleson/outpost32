<template>
  <div id="app">
    <h5 style="text-align: center;" id="nav">
      <router-link v-if="!loggedIn()" to="/">Login</router-link>
      <router-link v-if="!loggedIn()" to="/register"> | Register</router-link>
      <router-link v-if="loggedIn()" to="/example">Example</router-link>
      <router-link v-if="loggedIn()" to="/outpost">| Outpost</router-link>
      <router-link v-if="loggedIn()" to="/logout"> | Logout</router-link>
    </h5>
    <router-view/>
  </div>
</template>

<script>
export default {
  data() {
    return {
    };
  },
  methods: {
    loggedIn() {
      return !!localStorage.getItem("jwt");
    }
  },
};
</script>

<style scoped>
#nav {
  padding-top: 50px;
}
</style>