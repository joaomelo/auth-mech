<template>
  <div>
    <p>welcome {{ authMachine.user.email }}</p>
    <button @click.prevent="signOut">
      signOut
    </button>
  </div>
</template>

<script>
export default {
  name: 'PageHome',
  props: {
    authMachine: {
      type: Object,
      required: true
    }
  },
  methods: {
    signOut () {
      this.authMachine.service.signOut();
    }
  }
};
</script>
