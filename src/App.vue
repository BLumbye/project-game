<!-- 
  App 
-->

<template>
  <v-theme-provider :theme="isDark ? 'dark' : 'light'">
    <router-view></router-view>
  </v-theme-provider>
</template>

<!-- Script -->

<script setup lang="ts">
import { usePreferredDark } from '@vueuse/core';
import { RouterView } from 'vue-router';

const isDark = usePreferredDark();
</script>
