<template>
  <div class="events">
    <span class="news-label">
      NEWS:
      <span v-if="config.events.filter(event => event.week <= gameStore.week).length === 0">No news yet</span>
    </span>
    <div class="event-items">
      <div v-for="(event, i) in config.events"
           :key="event.week">
        <button @click="eventDialog![i].showModal()"
                class="event-button"
                v-if="event.week <= gameStore.week && event.title != 'NOTHING TO REPORT'">
          Week {{ event.week }}: {{ event.title }}
        </button>
        <dialog ref="eventDialog"
                @click="backgroundClickClose">
          <div class="event-content">
            <img :src="event.image"
                 :alt="event.title" />
            <div class="text"
                 v-if="event.showTitle || event.showDescription">
              <h2 v-if="event.showTitle">{{ event.title }}</h2>
              <p v-if="event.showDescription">{{ event.description }}</p>
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

const gameStore = useGameStore();

const eventDialog = ref<HTMLDialogElement[] | null>(null);

watch(() => gameStore.week, () => {
  const weekEvent = config.events.find(event => event.week === gameStore.week);
  if (weekEvent) {
    eventDialog.value![config.events.indexOf(weekEvent)].showModal();
  }
});
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
</style>
