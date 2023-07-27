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
  border: 1px solid #000000;
}

span {
  font-size: 20px;
  font-weight: bold;
  color: #000000;
  text-align: center;
  margin: 10px;
  padding: 10px;
  border-radius: 10px;
  width: 200px;
  height: 50px;
  background-color: #FFFFFF;
}

.logout-button {
  font-size: 20px;
  font-weight: bold;
  color: #000000;
  text-align: center;
  margin: 10px;
  padding: 10px;
  border: 2px solid #000000;
  border-radius: 10px;
  width: 200px;
  height: 50px;
  background-color: #FFFFFF;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}
</style>
  