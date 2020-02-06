<template>
  <div>
    <p>welcome {{ authMachine.authService.currentUser.email }}</p>
    <button @click.prevent="logout">
      logout
    </button>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  props: {
    authMachine: {
      type: Object,
      required: true
    }
  },
  methods: {
    logout () {
      this.authMachine.authService.signOut();
    }
  }
};
</script>
