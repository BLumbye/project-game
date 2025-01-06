<template>
  <dialog ref="modal" class="create-game-modal" @click="backgroundClickClose">
    <h2>Add Users</h2>
    <label for="usernames">Enter a comma separated list of user names.</label>
    <input id="usernames" v-model="usernames" type="text" placeholder="user1,user2..." class="fancy-input" />
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <div class="buttons">
      <button class="text-button" @click="() => modal?.close()">Cancel</button>
      <button :disabled="loading" @click="submit">
        {{ loading ? 'Loading...' : 'Add Users' }}
      </button>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { Games } from '~/pocketbase';
import { backgroundClickClose } from '~/utils/dialog';

const adminStore = useAdminStore();
const currentGame = inject<Ref<Games>>('currentGame')!;

const modal = ref<HTMLDialogElement | null>(null);

const loading = ref(false);
const usernames = ref('');
const errorMessage = ref<string | null>(null);

const open = () => {
  usernames.value = '';
  modal.value?.showModal();
};

const submit = async () => {
  loading.value = true;
  errorMessage.value = null;
  const response = await adminStore.addUsers(
    currentGame.value.game_id,
    usernames.value.split(',').map((s) => s.trim()),
  );
  if (response === true) modal.value?.close();
  else errorMessage.value = response;
  loading.value = false;
};

defineExpose({
  open,
});
</script>

<style scoped lang="postcss">
.create-game-modal {
  width: clamp(200px, 50%, 500px);
  text-align: left;

  & input {
    width: 100%;
  }

  & h2 {
    text-align: center;
  }

  & input + p {
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
