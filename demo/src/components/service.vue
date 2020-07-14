<template>
  <div>
    <SectionTitle>Service</SectionTitle>
    <MessageBoard>{{ message }}</MessageBoard>
    <form @submit="connect">
      <div>
        <input
          type="radio"
          name="rd-service"
          value="mock"
          checked
        >
        <label for="mock">Mock</label>
      </div>
      <div>
        <input
          type="radio"
          name="rd-service"
          value="firebase"
        >
        <label for="firebase">Firebase</label>
      </div>
      <button>Connect</button>
    </form>
  </div>
</template>

<script>
import { AuthMech } from '__lib'; // @joaomelo/auth-mech
import { fireauth } from '__demo/firebase';

import SectionTitle from './section-title';
import MessageBoard from './message-board';

export default {
  name: 'Service',
  components: { SectionTitle, MessageBoard },
  data () {
    return {
      serviceType: null
    };
  },
  // teste
  computed: {
    message () {
      const result = this.serviceType
        ? `Connected to ${this.serviceType}`
        : 'Please choose a service and click connect';
      return result;
    }
  },
  methods: {
    connect (event) {
      event.preventDefault();

      this.serviceType = document.querySelector('input[name="rd-service"]:checked').value;

      const service = this.serviceType === 'firebase' ? fireauth : 'mock';
      const authMech = new AuthMech({
        service
      });
      this.$emit('connected', authMech);
    }
  }
};
</script>

<style scoped>
form {
  display: grid;
  column-gap: 10px;
  grid-template-columns: auto auto auto;
}
</style>
