<!-- 
  App 
-->

<template>
  <span class="loading"
        v-if="!gameStore.settingsLoaded">Loading...</span>
  <router-view v-else></router-view>
</template>

<!-- Script -->

<script setup lang="ts">
import { RouterView } from 'vue-router';

const gameStore = useGameStore();
</script>