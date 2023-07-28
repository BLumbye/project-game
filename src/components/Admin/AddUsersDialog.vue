<template>
  <dialog ref="modal"
          class="add-users-modal"
          @click="backgroundClickClose">
    <h2>Add Users</h2>
    <p>Enter the usernames of the users you want to add to the game. The "#" will be replaced by the users number.</p>
    <input type="text"
           placeholder="#-mmmyy"
           v-model="usernamePattern" />
    <p>Enter the number of users you want to add.</p>
    <input type="number"
           min="1"
           v-model="numberOfUsers" />
    <p v-if="errorMessage"
       class="error-message">{{ errorMessage }}</p>
    <div class="buttons">
      <button @click="modal?.close"
              class="text-button">Cancel</button>
      <button :disabled="loading"
              @click="submit">
        {{ loading ? "Loading..." : "Add Users" }}
      </button>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { backgroundClickClose } from '~/utils/dialog';

const adminStore = useAdminStore();

const modal = ref<HTMLDialogElement | null>(null);

const loading = ref(false);
const usernamePattern = ref("");
const numberOfUsers = ref(1);
const errorMessage = ref<string | null>(null);

const open = () => {
  usernamePattern.value = "";
  numberOfUsers.value = 1;
  modal.value?.showModal();
}

const submit = async () => {
  loading.value = true;
  errorMessage.value = null;
  const response = await adminStore.addUsers(usernamePattern.value, numberOfUsers.value);
  if (response === true) modal.value?.close();
  else errorMessage.value = response;
  loading.value = false;
}

defineExpose({
  open,
});
</script>

<style scoped lang="postcss">
.add-users-modal {
  width: clamp(200px, 50%, 500px);
  text-align: left;

  & h2 {
    text-align: center;
  }

  & input+p {
    margin-top: 1rem;
  }

  .buttons {
    margin-top: 1.5rem;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }
}
</style>