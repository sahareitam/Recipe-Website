import { createApp, reactive } from 'vue';
import App from './App.vue';
import routes from './router/index';
import axios from 'axios';
import VueAxios from 'vue-axios';
import { createRouter, createWebHistory } from 'vue-router';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';

// BootstrapVue 3
import BootstrapVue3 from 'bootstrap-vue-3';
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css';
import { BContainer, BRow, BCol } from 'bootstrap-vue-3';
import Vuelidate from '@vuelidate/core';


// Router setup
const router = createRouter({
  history: createWebHistory(),
  routes
});

// Shared store
const store = reactive({
  username: localStorage.getItem('username'),
  server_domain: 'http://localhost:3000',
  login(username) {
    localStorage.setItem('username', username);
    this.username = username;
    console.log('login', this.username);
  },
  logout() {
    console.log('logout');
    localStorage.removeItem('username');
    this.username = undefined;
  },
});

// Axios configuration
axios.defaults.baseURL = 'http://localhost:3000';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Axios interceptors
axios.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.logout();
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

// Create app
const app = createApp(App);

// Plugins
app.use(router);
app.use(VueAxios, axios);
app.use(BootstrapVue3);
app.use(Vuelidate); 

// Register global BootstrapVue3 components
app.component('BContainer', BContainer);
app.component('BRow', BRow);
app.component('BCol', BCol);

// Global properties
app.config.globalProperties.store = store;
app.config.globalProperties.$router = router;
app.config.globalProperties.axios = axios;

// Toast function
app.config.globalProperties.toast = (title, message, variant) => {
  console.log(`Toast: ${title} - ${message} (${variant})`);
};

// Make available globally for components using window
window.axios = axios;
window.store = store;
window.router = router;
window.toast = app.config.globalProperties.toast;

// Mount app
app.mount('#app');
