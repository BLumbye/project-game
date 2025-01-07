<template>
  <div class="clamped">
    <h2>Freeplay Mode</h2>
    <p>
      No synchronized game is currently in progress. Use the dropdown below to change the config used for freeplay mode
      or start a new game by clicking the "Create Game" button.
    </p>
    <div class="config-select-wrapper">
      <label for="config-select">Freeplay Config: </label>
      <select id="config-select" v-model="selectedConfig" @change="onConfigChange" v-if="selectedConfig !== undefined">
        <option v-for="config in configs" :key="config.name" :value="config.name">{{ config.name }}</option>
      </select>
      <span v-else>Loading...</span>
    </div>
    <button @click="createGameModal?.open">Create Game</button>
  </div>
</template>

<script setup lang="ts">
import configs from '~/config';
import CreateGameDialog from './CreateGameDialog.vue';

const adminStore = useAdminStore();
const createGameModal = inject('createGameModal', ref<typeof CreateGameDialog | null>(null));

const selectedConfig = ref<string | undefined>();

const onConfigChange = () => {
  console.log('onconfigchange');
  adminStore.setFreeplayConfig(selectedConfig.value!);
};

const settingsWatcher = watch(() => adminStore.settings, () => {
  if (adminStore.settings === undefined) return;
  selectedConfig.value = adminStore.settings.freeplay_config?.name;
  settingsWatcher();
}, { immediate: true });
</script>

<style scoped lang="postcss">
.clamped {
  width: clamp(300px, 80%, 600px);
  text-align: left;

  & p {
    margin-bottom: 1rem;
  }

  & .config-select-wrapper {
    margin-bottom: 1rem;

    & label {
      margin-right: 0.5rem;
    }
  }
}
</style>
