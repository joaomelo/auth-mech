<template>
  <div id="container">
    <main>
      <service
        class="section"
        @connected="updateAuthMech"
      />
      <auth
        :auth-mech="authMech"
        class="section"
      />
    </main>
  </div>
</template>

<script>
import Auth from './components/auth';
import Service from './components/service';

export default {
  name: 'App',
  components: { Auth, Service },
  data () {
    return {
      authMech: null
    };
  },
  methods: {
    updateAuthMech (authMech) {
      this.authMech = authMech;
    }
  }
};
</script>

<style scoped>
  #container {
    font-family: 'Roboto', sans-serif;
    display: flex;
    justify-content: center;
    min-height: 90vh;
  }

  main {
    background-color: rgb(245, 245, 245);
    border-radius: 25px;
    width: 350px;
    margin: 20px auto;
    padding: 5px;
  }

  .section {
    margin: 20px 20px 0px;
  }
</style>
