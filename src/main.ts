import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.pcss';
import '@csstools/normalize.css';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { pocketbase } from './pocketbase';
import routes from '~pages';
import FloatingVue from 'floating-vue';
import 'floating-vue/dist/style.css';

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from) => {
  const gameStore = useGameStore();

  if (to.name === 'game' && gameStore.synchronized && !pocketbase.authStore.isValid) return { name: 'auth' };
  if (to.name === 'admin' && (!pocketbase.authStore.isValid || !pocketbase.authStore.model!.admin))
    return { name: 'auth' };
});

const pinia = createPinia();
const app = createApp(App);

app.use(FloatingVue);
app.use(router);
app.use(pinia);

app.mount('#app');
