<!-- 
  App 
-->

<template>
  <v-theme-provider :theme="isDark ? 'dark' : 'light'">
    <span class="loading"
          v-if="!gameStore.settingsLoaded">Loading...</span>
    <router-view v-else></router-view>
  </v-theme-provider>
</template>

<!-- Script -->

<script setup lang="ts">
import { usePreferredDark } from '@vueuse/core';
import { RouterView } from 'vue-router';

const gameStore = useGameStore();
const isDark = usePreferredDark();
</script>