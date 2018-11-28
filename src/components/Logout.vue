<template>
  <div></div>
</template>

<script>
export default {
  mounted() {
    localStorage.removeItem("user");
    localStorage.removeItem("jwt");
    this.$router.push("/");
  }
};
</script>