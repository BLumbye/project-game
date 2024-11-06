<template>
  <div class="action-menu">
    <span class="game-state">{{ gameState }}</span>
    <button class="action-button" @click="doAction">{{ actionButtonText }}</button>
  </div>
</template>

<script setup lang="ts">
import { Games } from '~/pocketbase';
import AddUsersDialog from './AddUsersDialog.vue';
import ConfirmationDialog from './ConfirmationDialog.vue';
import { AdminData } from '~/hooks/adminData';

const adminStore = useAdminStore();
const currentGame = inject<Ref<Games>>('currentGame')!;
const currentGameData = inject<Ref<AdminData>>('currentGameData')!;

const addUsersModal = inject('addUsersModal', ref<typeof AddUsersDialog | null>(null));
const confirmModal = inject('confirmModal', ref<typeof ConfirmationDialog | null>(null));

const gameState = computed(() => {
  if (currentGame.value.game_state === 'adding_users') {
    return `Adding users (${currentGameData.value.users.length})`;
  } else if (currentGame.value.game_state === 'getting_bids') {
    return `Getting survey answers (${currentGameData.value.bids.length}/${currentGameData.value.users.length})`;
  } else if (currentGame.value.game_state === 'reviewing_bids') {
    return 'Reviewing survey answers';
  } else if (currentGame.value.game_state === 'in_progress') {
    return `Current ${currentGame.value.config.durationIdentifier.singular}: ${currentGame.value.current_week}\nReady: ${currentGameData.value.gameStates.filter((state) => state.ready).length}/${currentGameData.value.bids.length - currentGameData.value.gameStates.filter((state) => state.status === 'won').length}`;
  } else if (currentGame.value.game_state === 'finished') {
    return 'Game Finished';
  } else {
    return 'Unknown';
  }
});

const actionButtonText = computed(() => {
  if (currentGame.value.game_state === 'adding_users') {
    return currentGameData.value.users.length === 0 ? 'Add users' : 'Start accepting bids';
  } else if (currentGame.value.game_state === 'getting_bids') {
    return 'Close submissions';
  } else if (currentGame.value.game_state === 'reviewing_bids') {
    return 'Start game';
  } else if (currentGame.value.game_state === 'in_progress') {
    return currentGame.value.current_week === currentGame.value.config.projectDuration
      ? 'Finish game'
      : 'Go to next week';
  } else if (currentGame.value.game_state === 'finished') {
    return 'Stop game session';
  } else {
    return 'Unknown';
  }
});

function doAction() {
  if (currentGame.value.game_state === 'adding_users' && currentGameData.value.users.length === 0) {
    addUsersModal.value?.open();
  } else if (currentGame.value.game_state === 'adding_users' && currentGameData.value.users.length > 0) {
    adminStore.startAcceptingBids(currentGame.value.game_id);
  } else if (currentGame.value.game_state === 'getting_bids') {
    adminStore.stopAcceptingBids(currentGame.value.game_id);
  } else if (currentGame.value.game_state === 'reviewing_bids') {
    confirmModal.value!.confirm('Are you sure you want to start the game?', () =>
      adminStore.startGame(currentGame.value.game_id),
    );
  } else if (
    currentGame.value.game_state === 'in_progress' &&
    currentGame.value.current_week < currentGame.value.config.projectDuration
  ) {
    confirmModal.value!.confirm('Are you sure you want to progress to the next week?', () =>
      adminStore.progressWeek(currentGame.value.game_id),
    );
  } else if (
    currentGame.value.game_state === 'in_progress' &&
    currentGame.value.current_week === currentGame.value.config.projectDuration
  ) {
    confirmModal.value!.confirm('Are you sure you want to end the game?', () =>
      adminStore.finishGame(currentGame.value.game_id),
    );
  } else if (currentGame.value.game_state === 'finished') {
    confirmModal.value!.confirm('Are you sure you want to disable synchronized mode?', () =>
      adminStore.stopGameSession(currentGame.value.game_id),
    );
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
