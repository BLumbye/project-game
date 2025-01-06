<template>
  <dialog ref="modal" class="create-game-modal" @click="backgroundClickClose">
    <h2>Create Game</h2>
    <div class="config-select-wrapper">
      <label for="config-select">Config: </label>
      <select id="config-select" v-model="selectedConfig">
        <option v-for="config in configs" :key="config.name" :value="config.name">{{ config.name }}</option>
      </select>
    </div>
    <div class="buttons">
      <button class="text-button" @click="() => modal?.close()">Cancel</button>
      <button @click="submit">Create Game</button>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import configs from '~/config';
import { backgroundClickClose } from '~/utils/dialog';

const adminStore = useAdminStore();

const modal = ref<HTMLDialogElement | null>(null);

const selectedConfig = ref('');

const open = () => {
  selectedConfig.value = adminStore.settings?.freeplay_config?.name ?? configs[0].name;
  modal.value?.showModal();
};

const submit = () => {
  adminStore.createGame(selectedConfig.value);
  modal.value?.close();
};

defineExpose({
  open,
});
</script>

<style scoped lang="postcss">
.create-game-modal {
  width: clamp(200px, 50%, 500px);
  text-align: left;

  & h2 {
    text-align: center;
  }

  & .config-select-wrapper label {
    margin-right: 0.5rem;
  }

  .buttons {
    margin-top: 1.5rem;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }
}
</style>
