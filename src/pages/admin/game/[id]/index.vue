<template>
  <p v-if="currentGame.game_state === 'finished'">
    Game {{ currentGame.game_id }} using config "{{ currentGame.config.name }}" is finished. You can view the data from
    the game through the pages in the navigation.
  </p>
  <p v-else>Game {{ currentGame.game_id }} using config "{{ currentGame.config.name }}" is currently in progress.</p>
</template>

<script setup lang="ts">
import { Games } from '~/pocketbase';

const currentGame = inject<Ref<Games>>('currentGame')!;
</script>
