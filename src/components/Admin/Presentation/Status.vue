<template>
  <div class="status">
    <div class="ready">{{ ready }} / {{ totalTeams }}</div>
    <div class="ready-label">teams ready</div>
    <button class="continue-button" @click="doAction">{{ buttonText }}</button>
  </div>
</template>

<script setup lang="ts">
import { AdminData } from '~/hooks/adminData';
import { Games } from '~/pocketbase';

const adminStore = useAdminStore();
const currentGame = inject<Ref<Games>>('currentGame')!;
const currentGameData = inject<Ref<AdminData>>('currentGameData')!;

const emit = defineEmits<{
  (e: 'next-week'): void;
  (e: 'finish-game'): void;
}>();

const ready = computed(() => currentGameData.value.gameStates.filter((state) => state.ready).length);

const totalTeams = computed(
  () =>
    currentGameData.value.bids.length -
    currentGameData.value.gameStates.filter((state) => state.status === 'won').length,
);

const buttonText = computed(() => {
  return currentGame.value.current_week === currentGame.value.config.projectDuration
    ? 'Finish game'
    : `Next ${currentGame.value.config.durationIdentifier.singular} ->`;
});

function doAction() {
  if (
    currentGame.value.game_state === 'in_progress' &&
    currentGame.value.current_week < currentGame.value.config.projectDuration
  ) {
    adminStore.progressWeek(currentGame.value.game_id);
    emit('next-week');
  } else if (
    currentGame.value.game_state === 'in_progress' &&
    currentGame.value.current_week === currentGame.value.config.projectDuration
  ) {
    adminStore.finishGame(currentGame.value.game_id);
    emit('finish-game');
  }
}
</script>

<style scoped>
.status {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ready {
  font-size: 5rem;
  line-height: 1;
}

.ready-label {
  font-size: 2rem;
  margin-bottom: 2rem;
}

.continue-button {
  font-size: 1.5rem;
}
</style>
