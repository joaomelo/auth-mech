<template>
  <div class="container">
    <component
      :is="page"
      :auth-machine="authMachine"
    />
  </div>
</template>

<script>
import PageHome from './page-home';
import PageLogin from './page-login';
import PageSolving from './page-solving';

import { authMachine } from './auth';

export default {
  name: 'App',
  data () {
    return { authMachine };
  },
  computed: {
    page () {
      const components = {
        UNSOLVED: PageSolving,
        SIGNIN: PageHome,
        SIGNOUT: PageLogin
      };

      return components[this.authMachine.status];
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
