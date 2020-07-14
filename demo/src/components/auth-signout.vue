<template>
  <div>
    <MessageBoard>Please Sign Up or Sign In</MessageBoard>
    <form>
      <input
        v-model="email"
        type="email"
        placeholder="Email"
      >
      <input
        v-model="password"
        type="password"
        placeholder="Password"
      >
      <ButtonsPanel>
        <button
          type="button"
          @click="signUp"
        >
          Sign Up
        </button>
        <button
          type="button"
          @click="signIn"
        >
          Sign In
        </button>
      </ButtonsPanel>
    </form>
  </div>
</template>

<script>
import ButtonsPanel from './buttons-panel';
import MessageBoard from './message-board';

export default {
  name: 'AuthSignout',
  components: { MessageBoard, ButtonsPanel },
  props: {
    authMech: {
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
    signUp () {
      this.authMech.signUp({
        email: this.email,
        password: this.password
      });
    },
    signIn () {
      this.authMech.signIn({
        email: this.email,
        password: this.password
      });
    }
  }
};
</script>

<style scoped>

form > * {
  display: block;
  width: 80%;
  margin: 10px auto 0px;
}

</style>
