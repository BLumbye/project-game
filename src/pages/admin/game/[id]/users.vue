<template>
  <h2>Users ({{ currentGameData.users.length }})</h2>
  <div v-if="currentGameData.users.length === 0">
    <p class="game-state">Waiting for users to be added to the game.</p>
    <button @click="addUsersModal?.open()">Add Users</button>
  </div>
  <div v-else>
    <div class="users">
      <div
        v-for="user in currentGameData.users.sort((a, b) => a.username.localeCompare(b.username))"
        :key="user.id"
        class="user"
      >
        <span>{{ user.username }}</span>
      </div>
    </div>
    <div class="buttons" v-if="isGameInProgress">
      <button @click="addUsersModal?.open">Add More Users</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import AddUsersDialog from '~/components/Admin/AddUsersDialog.vue';
import { AdminData } from '~/hooks/adminData';

const isGameInProgress = inject<Ref<boolean>>('isGameInProgress')!;
const currentGameData = inject<Ref<AdminData>>('currentGameData')!;
const addUsersModal = inject('addUsersModal', ref<typeof AddUsersDialog | null>(null));
</script>

<style scoped lang="postcss">
.buttons {
  margin-top: 1.5rem;

  & button + button {
    margin-left: 1rem;
  }
}

.game-state {
  margin-bottom: 1rem;
}

.users {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  gap: 0.5em;
  justify-content: space-between;
  margin-top: 1rem;

  & .user {
    background-color: var(--boxed-background-color);
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    flex: 1;
    text-align: center;
    text-wrap: balance;
  }
}
</style>
