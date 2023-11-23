<template>
  <header>
    <span class="title">Project Game</span>
    <span v-if="$route.name === 'game' && gameStore.gameState === 'in_progress'">
      {{capitalize(config.durationIdentifier.singular)}} {{ gameStore.week }}
    </span>
    <span v-if="$route.name === 'game' && ['getting_bids', 'reviewing_bids'].includes(gameStore.gameState!)">
      Pre-Game Survey
    </span>
    <span v-if="isAdmin()">
      Admin Panel
    </span>
    <div class="right-side"
         v-if="pocketbase.authStore.isValid">
      <span>{{ pocketbase.authStore.model!.username }}</span>
      <button class="logout-button"
              @click="logout()">
        Log out
      </button>
    </div>
    <div class="right-side"
         v-else>
      <span>Guest</span>
      <RestartGame />
    </div>
  </header>
</template>

<script setup lang="ts">
import { pocketbase, isAdmin } from '~/pocketbase';
import {capitalize} from '~/utils/formatters';
import config from '~/config';

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