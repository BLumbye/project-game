<template>
  <h2>Game Progress ({{ config.durationIdentifier.singular }} {{ gameStore.maxWeek! }})</h2>
  <p v-if="adminStore.gameStates.length === 0" class="no-submissions">No users connected...</p>
  <GameProgressTable v-else class="progress-table" />
</template>

<script setup lang="ts">
import config from '~/config';
const gameStore = useGameStore();
const adminStore = useAdminStore();
</script>

<style scoped lang="postcss">
.progress-table,
.no-submissions {
  margin-top: 1rem;
}
</style>
