<template>
  <h3>Game Progress (week {{ gameStore.week }})</h3>
  <p class="no-submissions"
     v-if="adminStore.gameStates.length === 0">No users connected...</p>
  <GameProgressTable class="progress-table"
                     v-else />
</template>

<script setup lang="ts">
const gameStore = useGameStore();
const adminStore = useAdminStore();

/**
 * TODO:
 * Display a table with the following information:
 * - Username
 * - Status (playing, disconnected, won, lost)
 * - Overall progress
 * - Ready status
 * Additionally, have a button for going to the next week with a confirmation dialog.
 * When the game is finished go to a new page with the results.
 */
</script>

<style scoped lang="postcss"></style>