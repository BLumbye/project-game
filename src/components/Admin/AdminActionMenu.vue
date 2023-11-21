<template>
  <div class="action-menu">
    <span class="game-state">{{ gameState }}</span>
    <button class="action-button"
            @click="doAction">{{ actionButtonText }}</button>
  </div>
</template>

<script setup lang="ts">
import config from '~/config';
import AddUsersDialog from './AddUsersDialog.vue';
import ConfirmationDialog from './ConfirmationDialog.vue';

const gameStore = useGameStore();
const adminStore = useAdminStore();

const addUsersModal = inject('addUsersModal', ref<typeof AddUsersDialog | null>(null));
const confirmModal = inject('confirmModal', ref<typeof ConfirmationDialog | null>(null));

const gameState = computed(() => {
  if (gameStore.gameState === 'adding_users') {
    return `Adding users (${adminStore.users.length})`;
  } else if (gameStore.gameState === 'getting_bids') {
    return `Getting survey answers (${adminStore.bids.length}/${adminStore.users.length})`;
  } else if (gameStore.gameState === 'reviewing_bids') {
    return 'Reviewing survey answers';
  } else if (gameStore.gameState === 'in_progress') {
    return `Current week: ${gameStore.maxWeek!}\nReady: ${adminStore.gameStates.filter((state) => state.ready).length}/${adminStore.bids.length - adminStore.gameStates.filter((state) => state.status === 'won').length}`;
  } else if (gameStore.gameState === 'finished') {
    return 'Game Finished';
  } else {
    return 'Unknown';
  }
});

const actionButtonText = computed(() => {
  if (gameStore.gameState === 'adding_users') {
    return adminStore.users.length === 0 ? 'Add users' : 'Start accepting bids';
  } else if (gameStore.gameState === 'getting_bids') {
    return 'Close submissions';
  } else if (gameStore.gameState === 'reviewing_bids') {
    return 'Start game';
  } else if (gameStore.gameState === 'in_progress') {
    return gameStore.maxWeek! === config.duration ? 'Finish game' : 'Go to next week';
  } else if (gameStore.gameState === 'finished') {
    return 'Stop game session';
  } else {
    return 'Unknown';
  }
});

function doAction() {
  if (gameStore.gameState === 'adding_users' && adminStore.users.length === 0) {
    addUsersModal.value?.open();
  } else if (gameStore.gameState === 'adding_users' && adminStore.users.length > 0) {
    adminStore.startAcceptingBids();
  } else if (gameStore.gameState === 'getting_bids') {
    adminStore.stopAcceptingBids();
  } else if (gameStore.gameState === 'reviewing_bids') {
    confirmModal.value!.confirm('Are you sure you want to start the game?', adminStore.startGame);
  } else if (gameStore.gameState === 'in_progress' && gameStore.maxWeek! < config.duration) {
    confirmModal.value!.confirm('Are you sure you want to progress to the next week?', adminStore.progressWeek);
  } else if (gameStore.gameState === 'in_progress' && gameStore.maxWeek! === config.duration) {
    confirmModal.value!.confirm('Are you sure you want to end the game?', adminStore.finishGame);
  } else if (gameStore.gameState === 'finished') {
    confirmModal.value!.confirm('Are you sure you want to disable synchronized mode?', adminStore.stopGameSession);
  } else {
    console.error('Unknown game state');
  }
}
</script>

<style scoped lang="postcss">
.action-menu {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: calc(400px + 1.5rem);
  padding: 1.5rem;
  background-color: var(--boxed-background-color);
  border-radius: 12px;
  gap: 2rem;
}

.game-state {
  white-space: pre;
  text-align: left;
}
</style>