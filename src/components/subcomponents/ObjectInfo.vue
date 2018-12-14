<template>
  <div class="animated fadeIn animation-parameters objectInfoTooltip">
    <p class="strokeme">{{ name }}</p>
    <p class="strokeme" v-if="condition >= 0">Condition: {{condition}}/100</p>
    <p class="strokeme">some other thing</p>
  </div>
</template>

<script>
export default {
  props: ['name', 'condition'],
  name: 'ObjectInfo',
  data() {
    return {};
  },
};
</script>

<style scoped>
.strokeme {
  color: white;
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
}

.animation-parameters {
  animation-duration: 0.5s;
  /* animation-delay: 0.1s; */
}
</style>