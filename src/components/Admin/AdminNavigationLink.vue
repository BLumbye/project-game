<template>
  <component :is="disabled ? 'span' : 'router-link'" :to="to" :class="{ 'router-link-disabled': disabled }">
    <slot />
  </component>
</template>

<script setup lang="ts">
defineProps<{
  to: string;
  disabled: boolean;
}>();
</script>
