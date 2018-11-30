<template>
  <div></div>
</template>

<script>
export default {
  mounted() {
    localStorage.removeItem("user");
    localStorage.removeItem("outpostJwt");
    this.$router.push("/");
  }
};
</script>