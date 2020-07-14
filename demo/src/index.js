import Vue from 'vue';
import App from './app';

const app = new Vue({
  render: h => h(App)
});

app.$mount('#app');
