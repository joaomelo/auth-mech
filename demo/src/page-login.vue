<template>
  <form>
    <input
      v-model="email"
      type="email"
      placeholder="type email..."
    >
    <input
      v-model="password"
      type="password"
      placeholder="type password..."
    >
    <button @click.prevent="register">
      register
    </button>
    <button @click.prevent="login">
      login
    </button>
  </form>
</template>

<script>
export default {
  name: 'PageLogin',
  props: {
    fireauthMachine: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      email: null,
      password: null
    };
  },
  methods: {
    login () {
      this.fireauthMachine.service.signInWithEmailAndPassword(this.email, this.password);
    },
    register () {
      this.fireauthMachine.service.createUserWithEmailAndPassword(this.email, this.password);
    }
  }
};
</script>

<style scoped>
input {
  margin-bottom: 10px;
  padding: 2px
}

form {
  padding: 10px;
  border-color: gray;
  border-style: solid;
  border-width: 1px
}
</style>
