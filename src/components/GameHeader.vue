<template>
  <header>
    <span class="title">Project Game</span>
    <span>Day {{ gameStore.week }}</span>
    <div class="right-side"
         v-if="gameStore.synchronized">
      <span>{{ pocketbase.authStore.model!.username }}</span>
      <button class="logout-button"
              @click="logout()">Logout</button>
    </div>
    <span class="right-side"
          v-else>Guest</span>
  </header>
</template>

<script setup lang="ts">
import { pocketbase } from '~/pocketbase';

const gameStore = useGameStore();
const router = useRouter();

function logout() {
  pocketbase.authStore.clear();
  router.push('/');
}
</script>
  
<style scoped lang="postcss">
.right-side {
  display: flex;
  flex-direction: row;
  justify-content: right;
  align-items: center;
  gap: 1rem;
}

header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  width: 100%;
  background-color: var(--boxed-background-color);

  &>* {
    flex: 1;
  }
}

span {
  font-size: 20px;
  font-weight: 500;
}

.title {
  font-weight: bold;
  text-align: left;
}
</style>
  
<style lang="postcss">
#app {
  padding-top: 0 !important;
}
</style>