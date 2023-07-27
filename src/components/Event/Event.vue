<template>
  <div v-if="gameStore.week" class="events-content">
    <div v-for="(event, i) in config.events" :key="event.week">
      <button
        @click="eventDialog![i].showModal()"
        class="event"
        v-if="event.week <= gameStore.week && event.title != 'NOTHING TO REPORT'"
      >
        <h2>{{ event.title }} (Week: {{ event.week }})</h2>
      </button>
      <dialog ref="eventDialog" @click="dialogClickHandler">
        <img class="event-image" :src="event.image" :alt="event.title" />
        <div v-if="event.showTitle">
          <h2>{{ event.title }}</h2>
        </div>
        <div v-if="event.showDescription">
          <p>{{ event.description }}</p>
        </div>
      </dialog>      
    </div>
  </div>
</template>

<script setup lang="ts">
import config from '../../config';

const gameStore = useGameStore();

const eventDialog = ref<HTMLDialogElement[] | null>(null);

// Click outside the event popup (dialog) for it to disappear
function dialogClickHandler(e: MouseEvent) {
  if ((e.target as HTMLElement).tagName !== 'DIALOG')
    //This prevents issues with forms
    return;

  const rect = (e.target as HTMLElement).getBoundingClientRect();

  const clickedInDialog =
    rect.top <= e.clientY &&
    e.clientY <= rect.top + rect.height &&
    rect.left <= e.clientX &&
    e.clientX <= rect.left + rect.width;

  if (clickedInDialog === false) (e.target as HTMLDialogElement).close();
}



</script>

<style scoped lang="postcss">

.event-image {
  max-width: 80vw;
  max-height: 80vh;
}

.event {
  border: 1px solid #000000;
  width: 150px;
  height: 115px;
  flex: 1;
  margin: 5px;
}

.events-content {
  display: flex;
  flex-wrap: wrap;
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.event h2 {
  flex-grow: 1;
  flex-shrink: 1;
  font-size: 16px;
  margin: 5px;
}
</style>
