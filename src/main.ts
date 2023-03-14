import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.pcss';
import '@csstools/normalize.css';
import App from './App.vue';
import Auth from './pages/Auth.vue';
import Game from './pages/Game.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from './supabase';

const routes = [
  { path: '/', name: 'auth', component: Auth },
  { path: '/game', name: 'game', component: Game },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (to.name === 'auth' && session) return { name: 'game' };
  if (to.name === 'game' && !session) return { name: 'auth' };
});

const pinia = createPinia();
const app = createApp(App);

app.use(router);
app.use(pinia);

app.mount('#app');
