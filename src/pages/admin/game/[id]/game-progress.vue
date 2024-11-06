<template>
  <h2>Game Progress ({{ currentGame.config.durationIdentifier.singular }} {{ currentGame.current_week! }})</h2>
  <p v-if="currentGameData.gameStates.length === 0" class="no-submissions">No users connected...</p>
  <GameProgressTable v-else class="progress-table" />
</template>

<script setup lang="ts">
import { AdminData } from '~/hooks/adminData';
import { Games } from '~/pocketbase';

const currentGame = inject<Ref<Games>>('currentGame')!;
const currentGameData = inject<Ref<AdminData>>('currentGameData')!;
</script>

<style scoped lang="postcss">
.progress-table,
.no-submissions {
  margin-top: 1rem;
}
</style>
