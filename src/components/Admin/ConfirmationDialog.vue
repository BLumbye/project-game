<template>
  <dialog ref="modal" class="confirm-modal" @click="backgroundClickClose">
    <h2>Confirm Action</h2>
    <p>{{ prompt }}</p>
    <div class="buttons">
      <button class="text-button" @click="() => modal?.close()">Cancel</button>
      <button
        @click="
          () => {
            func();
            modal?.close();
          }
        "
      >
        Confirm
      </button>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { backgroundClickClose } from '~/utils/dialog';

const modal = ref<HTMLDialogElement | null>(null);
const prompt = ref('');
const func = ref<() => void>(() => null);

const confirm = (text: string, action: () => void) => {
  prompt.value = text;
  func.value = action;
  modal.value?.showModal();
};

defineExpose({
  confirm,
});
</script>

<style scoped lang="postcss">
.confirm-modal {
  width: clamp(200px, 50%, 500px);
  text-align: left;

  .buttons {
    margin-top: 1.5rem;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }
}
</style>
