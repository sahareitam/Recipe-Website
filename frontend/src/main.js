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

// Updated Toast function - using simple Bootstrap alert styling
app.config.globalProperties.toast = (title, message, variant = 'info') => {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toastId = 'toast-' + Date.now();
  const toastHtml = `
    <div id="${toastId}" class="alert alert-${variant} alert-dismissible fade show" role="alert" style="min-width: 300px;">
      <strong>${title}</strong><br>
      ${message}
      <button type="button" class="btn-close" onclick="document.getElementById('${toastId}').remove()"></button>
    </div>`;
  
  toastContainer.insertAdjacentHTML('beforeend', toastHtml);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    const toastElement = document.getElementById(toastId);
    if (toastElement) {
      toastElement.remove();
    }
  }, 5000);
};

// Make available globally for components using window
window.axios = axios;
window.store = store;
window.router = router;
window.toast = app.config.globalProperties.toast;

// Mount app
app.mount('#app');