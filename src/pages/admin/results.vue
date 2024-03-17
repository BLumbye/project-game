<template>
  <h2>Results</h2>
  <p v-if="adminStore.gameStates.length === 0" class="no-submissions">No one played the game...</p>
  <ResultsTable v-else class="results-table" />
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
