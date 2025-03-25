<template>
  <div class="presentation-event" :class="{ 'no-event': event === undefined }">
    <template v-if="event === undefined">
      <div class="event-text">
        <p class="current-time">{{ `${capitalize(currentGame.config.durationIdentifier.singular)} ${currentTime}` }}</p>
        <p class="nothing-to-report">
          Nothing to report this {{ capitalize(currentGame.config.durationIdentifier.singular) }}
        </p>
      </div>
    </template>
    <template v-else>
      <img :src="event.image" :alt="event.title" class="event-image" />
      <div class="event-text">
        <p class="current-time">{{ `${capitalize(currentGame.config.durationIdentifier.singular)} ${currentTime}` }}</p>
        <p class="event-title">{{ event.title }}</p>
        <p class="event-description">{{ event.description }}</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Games } from '~/pocketbase';
import { capitalize } from '~/utils/formatters';
import { Event as TEvent } from '~/types/types';

defineProps<{
  event?: TEvent;
  currentTime: number;
}>();

const currentGame = inject<Ref<Games>>('currentGame')!;
</script>

<style scoped>
.presentation-event {
  display: flex;
  align-items: start;
  justify-content: center;
  gap: 3rem;
}

.current-time {
  font-size: 2.5rem;
  font-weight: bold;
  text-transform: uppercase;
  opacity: 0.7;
  margin-bottom: -0.25rem;
}

.nothing-to-report,
.event-title {
  font-size: 5rem;
  font-weight: bold;
  text-wrap: balance;
  line-height: 1.2;
  margin-bottom: 0.5rem;
}

.no-event .event-text {
  text-align: center;
}

.event-description {
  font-size: 2.5rem;
  text-wrap: pretty;
}

.event-image {
  max-width: 40vw;
  max-height: 40vh;
}

.event-text {
  max-width: 40vw;
}
</style>
