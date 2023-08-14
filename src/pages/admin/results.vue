<template>
  <h2>Results</h2>
  <p class="no-submissions"
     v-if="adminStore.gameStates.length === 0">No one played the game...</p>
  <ResultsTable class="results-table"
                v-else />
</template>

<script setup lang="ts">
const adminStore = useAdminStore();
</script>

<style scoped lang="postcss">
.results-table,
.no-submissions {
  margin-top: 1rem;
}
</style>