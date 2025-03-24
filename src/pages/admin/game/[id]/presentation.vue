<template>
  <div class="presentation" :class="{ 'is-fullscreen': isFullscreen }" ref="presentation-container">
    <OverviewTable :duration="currentGame.config.projectDuration" :currentTime="currentGame.current_week" />
    <PresentationEvent class="presentation-event" :event="currentEvent" :currentTime="currentGame.current_week" />
    <div class="timer-status-container">
      <Timer class="timer" ref="timer" />
      <Status class="status" @next-week="timer!.resetTimer()" />
    </div>

    <button @click="toggle" class="fullscreen-button" :class="{ 'is-fullscreen': isFullscreen }"><Fullscreen /></button>
  </div>
</template>

<script setup lang="ts">
import { useFullscreen } from '@vueuse/core';
import { AdminData } from '~/hooks/adminData';
import { Games } from '~/pocketbase';
import { Fullscreen } from 'lucide-vue-next';
import Timer from '~/components/Admin/Presentation/Timer.vue';
const currentGame = inject<Ref<Games>>('currentGame')!;
const currentGameData = inject<Ref<AdminData>>('currentGameData')!;

const timer = useTemplateRef<typeof Timer>('timer');

const currentEvent = computed(() => {
  return Object.values(currentGame.value.config.events).find((event) => event.week === currentGame.value.current_week);
});

// const currentEvent = computed(() => {
//   return currentGame.value.config.events['terraceExtension'];
// });

const presentationContainer = useTemplateRef<HTMLDivElement>('presentation-container');
const { isFullscreen, enter, exit, toggle } = useFullscreen(presentationContainer);
</script>

<style scoped>
.presentation {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  background: var(--background-color);
  padding-bottom: 1.5rem;
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
</style>
