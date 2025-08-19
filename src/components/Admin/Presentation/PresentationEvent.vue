<template>
  <div class="presentation-event" :class="{ 'no-event': events.length === 0 }">
    <template v-if="currentTime === currentGame.config.projectDuration">
      <div class="event-text">
        <p class="current-time">{{ `${capitalize(currentGame.config.durationIdentifier.singular)} ${currentTime}` }}</p>
        <p class="game-over">Game over</p>
        <p class="game-over-description">
          The deadline is here. If you have not completed the project, the contractor will terminate your contract.
        </p>
      </div>
    </template>
    <template v-else-if="events.length === 0">
      <div class="event-text">
        <p class="current-time">{{ `${capitalize(currentGame.config.durationIdentifier.singular)} ${currentTime}` }}</p>
        <p class="nothing-to-report">
          Nothing to report this {{ capitalize(currentGame.config.durationIdentifier.singular) }}
        </p>
      </div>
    </template>
    <template v-else>
      <img :src="currentEvent.image" :alt="currentEvent.title" class="event-image" />
      <div class="event-text">
        <p class="current-time">{{ `${capitalize(currentGame.config.durationIdentifier.singular)} ${currentTime}` }}</p>
        <p class="event-title">{{ currentEvent.title }}</p>
        <p class="event-description">{{ currentEvent.description }}</p>
        <div class="event-buttons" v-if="events.length > 1">
          <button class="event-button" @click="currentEventIndex--" :disabled="currentEventIndex === 0">
            Previous
          </button>
          <button class="event-button" @click="currentEventIndex++" :disabled="currentEventIndex === events.length - 1">
            Next
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Games } from '~/pocketbase';
import { capitalize } from '~/utils/formatters';
import { Event as TEvent } from '~/types/types';

const props = defineProps<{
  events: TEvent[];
  nextEvents: TEvent[];
  currentTime: number;
}>();

const currentEventIndex = ref(0);

const currentEvent = computed(() => {
  return props.events[currentEventIndex.value];
});

watch(
  () => props.currentTime,
  () => (currentEventIndex.value = 0),
);

// Preload images for next events
watch(
  () => props.nextEvents,
  (newEvents) => {
    newEvents.forEach((event) => {
      if (event.image) {
        const img = new Image();
        img.src = event.image;
      }
    });
  },
);

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
.event-title,
.game-over {
  font-size: 5rem;
  font-weight: bold;
  text-wrap: balance;
  line-height: 1.2;
  margin-bottom: 0.5rem;
}

.no-event .event-text {
  text-align: center;
}

.event-description,
.game-over-description {
  font-size: 2.5rem;
  line-height: 1.15;
  text-wrap: pretty;
}

.event-image {
  max-width: 40vw;
  max-height: 40vh;
}

.event-text {
  max-width: 40vw;
}

.event-buttons {
  display: flex;
  margin-top: 1rem;
  width: 40vw;
  justify-content: space-between;
}
</style>
