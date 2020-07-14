<template>
  <div>
    <MessageBoard>Signed in as {{ authMech.userData.email }}</MessageBoard>
    <ButtonsPanel>
      <button
        type="button"
        @click="authMech.signOut()"
      >
        Sign Out
      </button>
    </ButtonsPanel>
  </div>
</template>

<script>
import ButtonsPanel from './buttons-panel';
import MessageBoard from './message-board';

export default {
  name: 'AuthSignin',
  components: { MessageBoard, ButtonsPanel },
  props: {
    authMech: {
      type: Object,
      required: true
    }
  }
};
</script>

<style>

</style>
