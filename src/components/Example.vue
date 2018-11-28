<template>
  <div class="animated fadeIn">
    <h1>{{message}}</h1>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: "Welcome to example component"
    };
  }
};
</script>

<style scoped>
* {
  border: 1px solid red;
}
</style>