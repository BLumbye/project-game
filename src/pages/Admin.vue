<template>
  <GameHeader />
  <AdminNavigation />
  <main>
    <router-view></router-view>
  </main>

  <ConfirmationDialog ref="confirmModal" />
  <CreateGameDialog ref="createGameModal" />
</template>

<script setup lang="ts">
import { isAdmin, pocketbase } from '~/pocketbase';
import ConfirmationDialog from '~/components/Admin/ConfirmationDialog.vue';
import CreateGameDialog from '~/components/Admin/CreateGameDialog.vue';

const confirmModal = ref<typeof ConfirmationDialog | null>(null);
const createGameModal = ref<typeof CreateGameDialog | null>(null);

if (!pocketbase.authStore.isValid || !isAdmin()) {
  console.log('redirecting from admin...');
  useRouter().push('/');
}

provide('confirmModal', confirmModal);
provide('createGameModal', createGameModal);
</script>

<style scoped lang="postcss">
main {
  display: flex;
  flex-direction: column;
  text-align: left;
  padding: 2rem;
  padding-bottom: 130px;
  align-self: flex-start;
  max-height: 100%;
  overflow-y: auto;
}
</style>

<style>
#app {
  padding-bottom: 0;
  max-height: 100vh;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
}

header {
  grid-column: 1 / 3;
}

.admin-action-menu {
  position: fixed;
  bottom: 20px;
}
</style>

<route>
{
  name: "admin"
}
</route>
