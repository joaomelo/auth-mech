import Vue from 'vue';
import App from './app.vue';

Vue.config.productionTip = false;

const vueApp = new Vue({
  render: h => h(App)
});

vueApp.$mount('#app');
