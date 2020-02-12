<template>
  <div>
    <div class="container">
      <component
        :is="page"
        :auth-machine="authMachine"
      />
    </div>
    <ul>
      <li style="font-weight: bold">
        auth-machine events triggered:
      </li>
      <li
        v-for="(log, index) in logs"
        :key="index"
      >
        {{ log.when }}: {{ log.email }} | {{ log.status }}
      </li>
    </ul>
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
    return {
      authMachine,
      logs: []
    };
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
  },
  created () {
    this.authMachine.subscribe(this.addLog);
  },
  methods: {
    addLog ({ user, status }) {
      const log = {
        when: Date.now(),
        email: user ? user.email : 'none',
        status
      };
      this.logs.push(log);
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
