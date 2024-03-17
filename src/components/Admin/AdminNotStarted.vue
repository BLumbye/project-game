<template>
  <div class="clamped">
    <p>
      No synchronized game is currently in progress, click below to create a game. Doing this will disallow free play
      while the game is in progress.
    </p>
    <button @click="adminStore.createGame">Create Game</button>
  </div>
</template>

<script setup lang="ts">
const adminStore = useAdminStore();
</script>

<style scoped lang="postcss">
.clamped {
  width: clamp(300px, 80%, 600px);
  text-align: center;

  & p {
    margin-bottom: 1rem;
  }
}
</style>
