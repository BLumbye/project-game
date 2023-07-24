
<template>
      <div class="events-content">
        <div v-for="(event,i) in config.events" :key="event.week">
          <button @click="eventDialog![i].showModal()"
          class ="event" v-if="event.week <= gameStore.week">
            <h2>{{ event.title }} (Week: {{event.week}})</h2>
          </button>
          <dialog ref = "eventDialog" @click="dialogClickHandler">
            <img :src="event.image" :alt="event.title" />
          </dialog>
        </div>
      </div>
</template>
  
  <script setup lang="ts">
  
  import config from '../../config';

  const gameStore = useGameStore();

  const eventDialog = ref<HTMLDialogElement[]|null>(null);
  
  // Click outside the event popup (dialog) for it to dissappear
  function dialogClickHandler(e: MouseEvent) {
    if ((e.target as HTMLElement).tagName !== 'DIALOG') //This prevents issues with forms
        return;

    const rect = (e.target as HTMLElement).getBoundingClientRect();

    const clickedInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
    );

    if (clickedInDialog === false)
        (e.target as HTMLDialogElement).close();
}

  </script>

<style scoped lang="postcss">

.events-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5); 
  display: flex;
  justify-content: center;
  align-items: center;
}

.event{
  border: 1px solid #000000;
}

.events-content {
  display: flex;
  background-color: #fff; 
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

</style>