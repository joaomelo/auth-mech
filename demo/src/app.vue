<template>
  <div>
    <div class="container">
      <component
        :is="page"
        :fireauth-machine="fireauthMachine"
      />
    </div>
    <ul>
      <li style="font-weight: bold">
        fireauth-machine events triggered:
      </li>
      <li
        v-for="log in logs"
        :key="log.when"
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

import { fireauthMachine } from './auth';

export default {
  name: 'App',
  data () {
    return {
      fireauthMachine,
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

      return components[this.fireauthMachine.status];
    }
  },
  created () {
    this.fireauthMachine.subscribe(this.addLog);
  },
  methods: {
    addLog ({ user, status }) {
      const log = {
        when: (new Date()).toISOString(),
        email: user ? user.email : 'no user',
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
