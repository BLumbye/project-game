<template>
  <h2>Results</h2>
  <p v-if="currentGameData.gameStates.length === 0" class="no-submissions">No one played the game...</p>
  <ResultsTable v-else class="results-table" />
</template>

<script setup lang="ts">
import { AdminData } from '~/hooks/adminData';

const currentGameData = inject<Ref<AdminData>>('currentGameData')!;
</script>

<style scoped lang="postcss">
.results-table,
.no-submissions {
  margin-top: 1rem;
}
</style>
