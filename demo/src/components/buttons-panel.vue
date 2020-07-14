<template>
  <div class="buttons-panel">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'ButtonsPanel'
};
</script>

<style scoped>
  .buttons-panel{
    text-align: center
  }
</style>
