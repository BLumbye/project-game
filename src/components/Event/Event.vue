
<template>
    <h2 @click="toggleEventsOverlay"> [{{visible}} NEWS] </h2>
    <div v-if="showEventsOverlay" class="events-overlay">
      <div class="events-content">
        <div v-for="event in config.events" :key="event.week">
          <div v-if="event.week <= gameStore.week">
            <img :src="event.image" :alt="event.title" />
            <h2>{{ event.title }} (Week: {{event.week}})</h2>
            <p>{{ event.description }}</p>
          </div>
        </div>
      </div>
    </div>
</template>
  
  <script setup lang="ts">
  
  import config from '../../config';

  const gameStore = useGameStore();

  const showEventsOverlay = ref(false);
  var visible = 'SHOW';
  function toggleEventsOverlay() {
    showEventsOverlay.value = !showEventsOverlay.value;
    visible = showEventsOverlay.value ? 'HIDE' : 'SHOW';    
  }
  </script>

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

.news-content {
  background-color: #fff; 
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
