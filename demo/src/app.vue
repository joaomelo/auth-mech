<template>
  <div class="container">
    <PageHome
      v-if="loginState === 'LOGGEDIN'"
      :auth-machine="authMachine"
    />

    <PageLogin
      v-if="loginState === 'LOGGEDOUT'"
      :auth-machine="authMachine"
    />

    <p v-if="loginState === 'UNSOLVED'">
      Solving user...
    </p>
  </div>
</template>

<script>
import PageHome from './page-home';
import PageLogin from './page-login';

import { authMachine } from './auth';

export default {
  name: 'App',
  components: {
    PageHome,
    PageLogin
  },
  data () {
    return { authMachine };
  },
  computed: {
    loginState () {
      return this.authMachine.authStatus;
    }
  }
};
</script>

<style scoped>
.container {
  text-align: center;
  width: 200px;
  margin: 50px auto;
}
</style>
