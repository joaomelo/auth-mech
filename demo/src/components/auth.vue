<template>
  <div>
    <SectionTitle>Auth</SectionTitle>
    <component
      :is="authComponent"
      :auth-mech="authMech"
    />
  </div>
</template>

<script>
import SectionTitle from './section-title';
import AuthUnconnected from './auth-unconnected';
import AuthUnsolved from './auth-unsolved';
import AuthSignout from './auth-signout';
import AuthPending from './auth-pending';
import AuthSignin from './auth-signin';

export default {
  name: 'Auth',
  components: {
    SectionTitle,
    AuthUnconnected,
    AuthUnsolved,
    AuthSignout,
    AuthPending,
    AuthSignin
  },
  props: {
    authMech: {
      type: Object,
      default: null
    }
  },
  computed: {
    authComponent () {
      if (!this.authMech) return AuthUnconnected;

      const authComponents = {
        UNSOLVED: AuthUnsolved,
        SIGNEDOUT: AuthSignout,
        PENDING: AuthPending,
        SIGNEDIN: AuthSignin
      };

      return authComponents[this.authMech.status];
    }
  }
};
</script>

<style>

</style>
