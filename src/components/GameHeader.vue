<template>
  <header>
    <span>Project Game</span>
    <span>Current week: {{ gameStore.week }}</span>
    <div class="right-side"
         v-if="gameStore.synchronized">
      <div class="text">{{ pocketbase.authStore.model!.username }}</div>
      <button class="logout-button"
              @click="logout()">Logout</button>
    </div>
    <div class="right-side"
         v-else>Guest</div>
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
  justify-content: space-evenly;
  align-items: center;
}

header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  width: 100%;
  background-color: var(--boxed-background-color);
}

span {
  font-size: 20px;
  font-weight: bold;
}
</style>
  
<style lang="postcss">
#app {
  padding-top: 0 !important;
}
</style>