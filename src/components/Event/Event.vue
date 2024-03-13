<template>
  <div class="events">
    <span class="news-label">
      NEWS:
      <span v-if="config.events.filter(event => event.week <= gameStore.week).length === 0">No news yet</span>
    </span>
    <div class="event-items">
      <div v-for="(event, i) in config.events" :key="event.week">
        <button @click="eventDialog![i].showModal()" class="event-button"
          v-if="event.week <= gameStore.week && event.title != 'NOTHING TO REPORT'">
          {{ capitalize(config.durationIdentifier.singular) }} {{ event.week }}: {{ event.title }}
        </button>
        <dialog ref="eventDialog" @keydown.escape.prevent
          @click="e => preventCloseChoice(event, () => backgroundClickClose(e))">
          <!-- An event with a choice should not be closeable without making a decision -->
          <div class="event-content">
            <button class="close-button"
              @click="e => preventCloseChoice(event, () => closeEvent(eventDialog![i]))">&#10006;</button>
            <img :src="event.image" :alt="event.title" />
            <div class="text" v-if="event.showTitle || event.showDescription">
              <h2 v-if="event.showTitle">{{ event.title }}</h2>
              <p v-if="event.showDescription">{{ event.description }}</p>
              <div v-if="event.choice">
                <div v-if="event.accepted === undefined" class="choices">
                  <button class="ChoiceButton" @click="accepted(event)" :style="{ backgroundColor: 'green' }">
                    Accept
                  </button>
                  <button class="ChoiceButton" @click="declined(event)" :style="{ backgroundColor: 'red' }">
                    Decline
                  </button>
                </div>
                <p v-if="event.accepted" color="green">You accepted the event</p>
                <p v-if="event.accepted == false" color="red">You declined the event</p>
              </div>
            </div>
          </div>
        </dialog>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import config from '../../config';
import { backgroundClickClose } from '~/utils/dialog';
import { capitalize } from '~/utils/formatters';
import { Event } from '../../types/types';

const gameStore = useGameStore();

const eventDialog = ref<HTMLDialogElement[] | null>(null);

watch(() => gameStore.week, () => {
  const weekEvent = config.events.filter(event => event.week === gameStore.week);
  for (let i = 0; i < weekEvent.length; i++) {
    eventDialog.value![config.events.indexOf(weekEvent[i])].showModal();
  }
});

const preventCloseChoice = (event: Event, func: () => void) => {
  if (event.choice && event.accepted === undefined) {
    return; // Do not close the dialog if the user has not made a decision
  }
  func();
};

const closeEvent = (dialog: HTMLDialogElement) => {
  dialog.close();
};

const accepted = (event: Event) => {
  event.accepted = true;
  console.log(event.accepted);
};

const declined = (event: Event) => {
  event.accepted = false;
  console.log(event.accepted);
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
    padding: .5rem;

    & p {
      max-width: 600px;
      margin: auto;
    }
  }
}

.close-button {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 2rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0;
  color: #ffffff;
  opacity: .75;
  transition: opacity .2s ease-in-out;
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
</style>
