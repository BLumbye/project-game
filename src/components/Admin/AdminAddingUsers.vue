<template>
  <div v-if="adminStore.users.length === 0"
       class="clamped">
    <p class="game-state">Waiting for users to be added to the game.</p>
    <button @click="addUsersModal?.open()">Add Users</button>
  </div>
  <div v-else
       class="clamped">
    <h3>Users ({{ adminStore.users.length }})</h3>
    <div class="users">
      <div v-for="user in adminStore.users.sort((a, b) => a.username.localeCompare(b.username))"
           :key="user.id"
           class="user">
        <span>{{ user.username }}</span>
      </div>
    </div>
    <div class="buttons">
      <button @click="addUsersModal?.open">Add More Users</button>
      <button @click="adminStore.startAcceptingBids">Start Accepting Bids</button>
    </div>
  </div>
  <AddUsersDialog ref="addUsersModal" />
</template>

<script setup lang="ts">
import AddUsersDialog from '~/components/Admin/AddUsersDialog.vue';

const adminStore = useAdminStore();
const addUsersModal = ref<typeof AddUsersDialog | null>(null);
</script>

<style scoped lang="postcss">
.clamped {
  width: clamp(300px, 80%, 600px);
  text-align: center;

  & p {
    margin-bottom: 1rem;
  }
}

.buttons {
  margin-top: 1.5rem;

  & button+button {
    margin-left: 1rem;
  }
}

.users {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  gap: 0.5em;
  justify-content: space-between;

  & .user {
    background-color: var(--boxed-background-color);
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    flex: 1;
  }
}
</style>