<template>
   <h2>Game Progress ({{config.durationIdentifier.singular}} {{ gameStore.maxWeek! }})</h2>
   <p class="no-submissions"
      v-if="adminStore.gameStates.length === 0">No users connected...</p>
   <GameProgressTable class="progress-table"
                      v-else />
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