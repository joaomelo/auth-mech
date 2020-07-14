<template>
  <p><slot>I am a MessageBoard component</slot></p>
</template>

<script>
export default {
  name: 'MessageBoard'
};
</script>

<style scoped>
p {
  text-align: center;
  font-weight: bold;
  color: rgb(60, 60, 60);
}
</style>
