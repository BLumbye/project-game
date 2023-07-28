<template>
  <div class="events-content">
    <span class="news-label">NEWS:</span>
    <div class="events">
      <div v-for="(event, i) in config.events"
           :key="event.week">
        <button @click="eventDialog![i].showModal()"
                class="event"
                v-if="event.week <= gameStore.week && event.title != 'NOTHING TO REPORT'">
          Week {{ event.week }}: {{ event.title }}
        </button>
        <dialog ref="eventDialog"
                @click="backgroundClickClose">
          <img class="event-image"
               :src="event.image"
               :alt="event.title" />
          <div v-if="event.showTitle">
            <h2>{{ event.title }}</h2>
          </div>
          <div v-if="event.showDescription">
            <p>{{ event.description }}</p>
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
.event-image {
  max-width: 80vw;
  max-height: 80vh;
}

.events {
  display: flex;
  height: 100%;
  flex: 1;
  overflow-x: auto;
  gap: 10px;
}

.event {
  white-space: nowrap;
}

.events-content {
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
</style>
