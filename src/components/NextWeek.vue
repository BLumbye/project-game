<template>
  <button class="next-week-button">Next Week -></button>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue';

const emit = defineEmits<{
  (e: 'week-progressed'): void
}>();
</script>

<style scoped lang="postcss">
.next-week-button {
  text-align: center;
  font-size: 1rem;
}

</style>
