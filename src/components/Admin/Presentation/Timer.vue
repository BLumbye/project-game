<template>
  <div class="timer">
    <div class="timer-inputs">
      <input
        type="text"
        v-model="minutesTens"
        :disabled="isRunning"
        maxlength="1"
        pattern="\d"
        @input="handleInput($event, 0)"
        @keydown="handleKeydown($event, 0)"
        @focus="handleFocus($event)"
        @blur="handleBlur($event, 0)"
        ref="input0"
      />
      <input
        type="text"
        v-model="minutesOnes"
        :disabled="isRunning"
        maxlength="1"
        pattern="\d"
        @input="handleInput($event, 1)"
        @keydown="handleKeydown($event, 1)"
        @focus="handleFocus($event)"
        @blur="handleBlur($event, 1)"
        ref="input1"
      />
      <span class="separator">:</span>
      <input
        type="text"
        v-model="secondsTens"
        :disabled="isRunning"
        maxlength="1"
        pattern="\d"
        @input="handleInput($event, 2)"
        @keydown="handleKeydown($event, 2)"
        @focus="handleFocus($event)"
        @blur="handleBlur($event, 2)"
        ref="input2"
      />
      <input
        type="text"
        v-model="secondsOnes"
        :disabled="isRunning"
        maxlength="1"
        pattern="\d"
        @input="handleInput($event, 3)"
        @keydown="handleKeydown($event, 3)"
        @focus="handleFocus($event)"
        @blur="handleBlur($event, 3)"
        ref="input3"
      />
    </div>
    <button @click="toggleTimer" :title="isRunning ? 'Stop' : 'Start'">
      <PlayIcon :size="48" v-if="!isRunning" />
      <PauseIcon :size="48" v-else />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { templateRef } from '@vueuse/core';
import { PlayIcon, PauseIcon } from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'finished'): void;
}>();

const minutesTens = ref('1');
const minutesOnes = ref('0');
const secondsTens = ref('0');
const secondsOnes = ref('0');
const isRunning = ref(false);
const animationFrameId = ref<number>();
const remainingMilliseconds = ref(0);
const lastTimestamp = ref<number>();

const input0 = templateRef<HTMLInputElement>('input0', null);
const input1 = templateRef<HTMLInputElement>('input1', null);
const input2 = templateRef<HTMLInputElement>('input2', null);
const input3 = templateRef<HTMLInputElement>('input3', null);
const inputs = [input0, input1, input2, input3];
const digitRefs = [minutesTens, minutesOnes, secondsTens, secondsOnes];

function focusInput(index: number) {
  if (index >= 0 && index < inputs.length) {
    inputs[index].value?.focus();
  }
}

function handleFocus(event: FocusEvent) {
  const input = event.target as HTMLInputElement;
  input.select();
}

function handleInput(event: Event, index: number) {
  const input = event.target as HTMLInputElement;
  const value = input.value;

  // Only allow digits
  if (!/^\d*$/.test(value)) {
    digitRefs[index].value = '';
    return;
  }

  // Validate minutes and seconds
  if (index === 0 && parseInt(value + minutesOnes.value) > 59) {
    digitRefs[index].value = '5';
  } else if (index === 2 && parseInt(value + secondsOnes.value) > 59) {
    digitRefs[index].value = '5';
  } else {
    digitRefs[index].value = value;
  }

  // Auto-advance to next input after setting the value
  if (value && index < 3) {
    // Use nextTick to ensure the value is updated before focusing
    nextTick(() => {
      focusInput(index + 1);
    });
  }
}

function handleKeydown(event: KeyboardEvent, index: number) {
  const target = event.target as HTMLInputElement;

  switch (event.key) {
    case 'Backspace':
      if (!target.value && index > 0) {
        event.preventDefault();
        focusInput(index - 1);
      }
      break;
    case 'ArrowLeft':
      event.preventDefault();
      focusInput(index - 1);
      break;
    case 'ArrowRight':
      event.preventDefault();
      focusInput(index + 1);
      break;
  }
}

function handleBlur(event: FocusEvent, index: number) {
  if (!digitRefs[index].value) {
    digitRefs[index].value = '0';
  }
}

function toggleTimer() {
  if (isRunning.value) {
    stopTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  const minutes = parseInt(minutesTens.value + minutesOnes.value);
  const seconds = parseInt(secondsTens.value + secondsOnes.value);
  remainingMilliseconds.value = (minutes * 60 + seconds) * 1000;

  if (remainingMilliseconds.value > 0) {
    isRunning.value = true;
    lastTimestamp.value = performance.now();
    animationFrameId.value = requestAnimationFrame(updateTimer);
  }
}

function updateTimer(timestamp: number) {
  if (!lastTimestamp.value) {
    lastTimestamp.value = timestamp;
  }

  const elapsed = timestamp - lastTimestamp.value;
  remainingMilliseconds.value -= elapsed;
  lastTimestamp.value = timestamp;

  // Update display
  const totalSeconds = Math.round(remainingMilliseconds.value / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  const minsStr = mins.toString().padStart(2, '0');
  const secsStr = secs.toString().padStart(2, '0');

  minutesTens.value = minsStr[0];
  minutesOnes.value = minsStr[1];
  secondsTens.value = secsStr[0];
  secondsOnes.value = secsStr[1];

  if (remainingMilliseconds.value <= 0) {
    emit('finished');
    stopTimer();
    return;
  }

  if (isRunning.value) {
    animationFrameId.value = requestAnimationFrame(updateTimer);
  }
}

function stopTimer() {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value);
  }
  isRunning.value = false;
}

function resetTimer() {
  stopTimer();
  minutesTens.value = '1';
  minutesOnes.value = '0';
  secondsTens.value = '0';
  secondsOnes.value = '0';
}

defineExpose({
  resetTimer,
});

// Clean up animation frame on component unmount
onUnmounted(() => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value);
  }
});
</script>

<style scoped>
.timer {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timer-inputs {
  display: flex;
  align-items: center;
}

input {
  font-size: 5rem;
  width: 1.5ch;
  text-align: center;
  padding: 0.5rem;
  border: none;
  border-radius: 0.25rem;
  background: transparent;
  color: var(--text-color);
}

.separator {
  font-size: 5rem;
  color: var(--text-color);
  margin: 0 0.25rem;
}

button {
  padding: 1rem;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
}

button:hover {
  background-color: var(--background-color);
}
</style>
