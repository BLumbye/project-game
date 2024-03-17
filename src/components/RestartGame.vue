<!-- 
  Restart Game Button

  A button used in freeplay (unsynchronized) mode to restart the game.
-->

<template>
  <button class="restart-button" @click="handleClick">Restart</button>
</template>

<!-- Script -->

<script setup lang="ts">
const handleClick = () => {
  localStorage.clear();
  location.reload();
};
</script>

<!-- Styling -->

<style scoped lang="postcss">
.done-button {
  text-align: center;
  font-size: 1rem;
}
</style>
