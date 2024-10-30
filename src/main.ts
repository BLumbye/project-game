import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.pcss';
import '@csstools/normalize.css';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { routes, handleHotUpdate } from 'vue-router/auto-routes';
import FloatingVue from 'floating-vue';
import 'floating-vue/dist/style.css';
import { createVuetify } from 'vuetify';
import { initializeChartjs } from '~/plugins/Chartjs';

const router = createRouter({
  history: createWebHistory(),
  routes,
});

if (import.meta.hot) {
  handleHotUpdate(router);
}

const pinia = createPinia();
const app = createApp(App);

app.use(FloatingVue);
app.use(router);
app.use(pinia);
app.use(createVuetify());

initializeChartjs();

app.mount('#app');
