<template>
  <div>
    <h1><slot /></h1>
  </div>
</template>

<script>
export default {
  name: 'SectionTitle'
};
</script>

<style scoped>
  h1 {
    margin: 0px;
    text-align: center;
    font-size: x-large;
  }
</style>
