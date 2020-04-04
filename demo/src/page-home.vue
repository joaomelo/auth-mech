<template>
  <div>
    <p>welcome {{ fireauthMachine.user.email }}</p>
    <button @click.prevent="signOut">
      signOut
    </button>
  </div>
</template>

<script>
export default {
  name: 'PageHome',
  props: {
    fireauthMachine: {
      type: Object,
      required: true
    }
  },
  methods: {
    signOut () {
      this.fireauthMachine.service.signOut();
    }
  }
};
</script>
