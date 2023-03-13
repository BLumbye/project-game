import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.pcss';
import '@csstools/normalize.css';
import App from './App.vue';
import Auth from './pages/Auth.vue';
import Game from './pages/Game.vue';
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', component: Auth },
  { path: '/game', component: Game },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const pinia = createPinia();
const app = createApp(App);

app.use(router);
app.use(pinia);

app.mount('#app');
