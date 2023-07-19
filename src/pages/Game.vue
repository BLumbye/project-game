<template>
  <div class="container">
    <WeeklyReport v-if="gameStore.week > 0" />
    <h2 v-else>No weekly report in week {{ gameStore.week }}</h2>
    <DecisionForm />
  </div>
</template>

<!-- Script -->

<script setup lang="ts">
const gameStore = useGameStore();
</script>

<!-- Styling -->

<style scoped lang="postcss">
.container {
  height: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: flex-start;
}
</style>

<route>
{
  name: "game"
}
</route>