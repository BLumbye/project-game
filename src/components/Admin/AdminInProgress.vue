<template>
  <p>Current week: {{ gameStore.week }}</p>
  <button @click="adminStore.progressWeek()">Go to next week</button>
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