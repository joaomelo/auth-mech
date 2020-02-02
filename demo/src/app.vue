<template>
  <div>
    <input
      v-model="a"
      type="number"
    >
    <br><br>
    <input
      v-model="b"
      type="number"
    >
    <br><br>
    <button @click="add">
      add
    </button>
    <br><br>
    <input
      v-model="total"
      type="number"
    >
  </div>
</template>

<script>
import { add } from '__lib';

export default {
  name: 'App',
  data () {
    return {
      a: 0,
      b: 0,
      total: 0
    };
  },
  methods: {
    add () {
      this.total = add(this.a, this.b);
    }
  }
};
</script>
