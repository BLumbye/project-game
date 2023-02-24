<template>
  <button class="next-week-button"
          @click="emit('week-progressed')">Next Week -></button>
</template>

<script setup lang="ts">
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
