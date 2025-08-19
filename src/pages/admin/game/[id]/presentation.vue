<template>
  <div class="presentation" :class="{ 'is-fullscreen': isFullscreen }" ref="presentation-container">
    <div class="chart-slide" v-if="slide === 0">
      <DurationDistributionChart :hide-outliers-default="true" :pixel-ratio="1" :font-size="36" />
    </div>
    <div class="chart-slide" v-if="slide === 1">
      <PriceDistributionChart
        :hide-usernames-default="true"
        :hide-outliers-default="true"
        :pixel-ratio="1"
        :font-size="36"
      />
    </div>
    <div
      class="chart-slide"
      v-if="slide === 2 && (currentGame.game_state === 'getting_bids' || currentGame.game_state === 'reviewing_bids')"
    >
      <AdminActionMenu class="action-menu" />
    </div>
    <div
      class="game-slide"
      v-if="slide === 2 && (currentGame.game_state === 'in_progress' || currentGame.game_state === 'finished')"
    >
      <OverviewTable :duration="currentGame.config.projectDuration" :currentTime="currentGame.current_week" />
      <PresentationEvent
        class="presentation-event"
        :events="currentEvent"
        :next-events="nextEvents"
        :currentTime="currentGame.current_week"
      />
      <div class="timer-status-container">
        <Timer class="timer" ref="timer" @finished="play" />
        <Status class="status" @next-week="timer!.resetTimer()" />
      </div>
    </div>

    <button @click="toggle" class="fullscreen-button" :class="{ 'is-fullscreen': isFullscreen }"><Fullscreen /></button>
  </div>
</template>

<script setup lang="ts">
import { onKeyStroke, useFullscreen, useKeyModifier } from '@vueuse/core';
import { AdminData } from '~/hooks/adminData';
import { Games } from '~/pocketbase';
import { Fullscreen } from 'lucide-vue-next';
import { useSound } from '@vueuse/sound';
import Timer from '~/components/Admin/Presentation/Timer.vue';
import timerSound from '~/assets/sounds/timer.wav';

const currentGame = inject<Ref<Games>>('currentGame')!;
const currentGameData = inject<Ref<AdminData>>('currentGameData')!;

const slide = ref(0);

const { play } = useSound(timerSound);
const timer = useTemplateRef<typeof Timer>('timer');

const currentEvent = computed(() => {
  return Object.values(currentGame.value.config.events).filter(
    (event) => event.week === currentGame.value.current_week,
  );
});

const nextEvents = computed(() => {
  return Object.values(currentGame.value.config.events).filter(
    (event) => event.week === currentGame.value.current_week + 1,
  );
});

// const currentEvent = computed(() => {
//   return currentGame.value.config.events['terraceExtension'];
// });

const presentationContainer = useTemplateRef<HTMLDivElement>('presentation-container');
const { isFullscreen, enter, exit, toggle } = useFullscreen(presentationContainer);

const ctrlState = useKeyModifier('Control');

onKeyStroke('ArrowRight', () => {
  if (slide.value >= 2) return;
  slide.value++;
});

onKeyStroke('ArrowLeft', () => {
  if (slide.value <= 0) return;
  if (slide.value == 2 && !ctrlState.value) return;
  slide.value--;
});
</script>

<style scoped>
.presentation {
  width: 100%;
  height: 100%;
  background: var(--background-color);
}

.game-slide {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1.5rem;
}

.chart-slide {
  width: 100%;
  height: 100%;
  padding: 2rem;
}

.fullscreen-button {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background: none;
  border: none;
  padding: 0.5rem;
  margin: 0;
  cursor: pointer;
  line-height: 1;
  transition:
    background 0.1s ease-in-out,
    opacity 0.1s ease-in-out;

  &.is-fullscreen {
    opacity: 0;
  }

  &:hover {
    background: var(--boxed-background-color);
    opacity: 1;
  }
}

.timer-status-container {
  display: flex;
  gap: 1.5rem;
  padding-inline: 1.5rem;
}

.timer,
.status {
  background: var(--boxed-background-color);
  border-radius: 0.5rem;
  padding: 1.5rem;
  flex-basis: 50%;
}

.action-menu {
  place-self: center;
  padding: 2rem;
}
</style>
