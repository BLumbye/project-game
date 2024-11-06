<template>
  <div class="events">
    <span class="news-label">
      NEWS:
      <span
        v-if="Object.entries(gameStore.config.events).filter(([, event]) => event.week <= gameStore.week).length === 0"
      >
        No news yet
      </span>
    </span>
    <div class="event-items">
      <div v-for="(event, name, i) in gameStore.config.events" :key="name">
        <button
          v-if="event.week <= gameStore.week && event.title != 'NOTHING TO REPORT'"
          class="event-button"
          @click="eventDialogues[i].showModal()"
        >
          {{ capitalize(gameStore.config.durationIdentifier.singular) }} {{ event.week }}: {{ event.title }}
        </button>
        <dialog
          ref="eventDialogues"
          @cancel="
            (e: Event) => {
              if (event.choices && eventStore.eventChoices[name] === undefined) e.preventDefault();
            }
          "
          @click="(e) => preventCloseChoice(event, name, () => backgroundClickClose(e))"
        >
          <!-- An event with a choice should not be closeable without making a decision -->
          <div class="event-content">
            <button
              class="close-button"
              @click="(e) => preventCloseChoice(event, name, () => closeEvent(eventDialogues[i]))"
            >
              &#10006;
            </button>
            <img :src="event.image" :alt="event.title" />
            <div v-if="event.showTitle || event.showDescription" class="text">
              <h2 v-if="event.showTitle">{{ event.title }}</h2>
              <p v-if="event.showDescription">{{ event.description }}</p>
              <div v-if="event.choices">
                <div v-if="eventStore.eventChoices[name] === undefined" class="choices">
                  <button
                    v-for="(choice, key) in event.choices"
                    :key="key"
                    class="choiceButton"
                    @click="eventStore.setEventChoice(name, key as string)"
                  >
                    {{ choice.label }}
                  </button>
                </div>
                <p v-else class="decision">{{ event.choices[eventStore.eventChoices[name]].chosenText }}</p>
              </div>
            </div>
          </div>
        </dialog>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { backgroundClickClose } from '~/utils/dialog';
import { capitalize } from '~/utils/formatters';
import { Event as TEvent } from '../../types/types';

const gameStore = useGameStore();
const eventStore = useEventStore();

const eventDialogues = ref<HTMLDialogElement[]>([]);

watch(
  () => gameStore.week,
  () => {
    const weekEvents = Object.entries(gameStore.config.events).filter(([, event]) => event.week === gameStore.week);
    //Show modal unless title is "NOTHING TO REPORT"
    weekEvents.forEach(
      ([name, event]) =>
        event.title !== 'NOTHING TO REPORT' &&
        eventDialogues.value[Object.keys(gameStore.config.events).indexOf(name)].showModal(),
    );
  },
);

const preventCloseChoice = (event: TEvent, eventName: string, func: () => void) => {
  if (event.choices && eventStore.eventChoices[eventName] === undefined) {
    return; // Do not close the dialog if the user has not made a decision
  }
  func();
};

const closeEvent = (dialog: HTMLDialogElement) => {
  dialog.close();
};
</script>

<style scoped lang="postcss">
.event-items {
  display: flex;
  height: 100%;
  flex: 1;
  overflow-x: auto;
  gap: 10px;
}

.event-button {
  white-space: nowrap;
}

.events {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 20px;
}

.news-label {
  font-size: 20px;
  font-weight: bold;
  margin-right: 10px;
}

dialog {
  padding: 0;
}

.event-content {
  display: table;

  & img {
    max-width: 60vw;
    max-height: 60vh;
  }

  & .text {
    display: table-caption;
    caption-side: bottom;
    padding: 0.5rem;

    & p {
      max-width: 600px;
      margin: auto;
    }
  }
}

.close-button {
  position: absolute;
  line-height: 1;
  top: 0;
  right: 0;
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.3rem;
  margin: 0;
  color: #fff;
  opacity: 0.75;
  transition: opacity 0.2s ease-in-out;
  mix-blend-mode: difference;

  &:hover {
    opacity: 1;
  }
}

.choices {
  display: flex;
  justify-content: space-evenly;
  margin-top: 1rem;
}

.decision {
  font-weight: bold;
  margin-top: 1rem;
}
</style>
