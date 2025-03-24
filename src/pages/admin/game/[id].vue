<template>
  <template v-if="currentGame">
    <template v-if="currentGameData && !currentGameData.loading">
      <router-view></router-view>
      <AdminActionMenu v-if="displayActionMenu" class="admin-action-menu" />
      <AddUsersDialog ref="addUsersModal" />
    </template>
    <p v-else>Loading...</p>
  </template>
  <template v-else>
    <h2>Game not found</h2>
    <p>The game you are looking for does not exist.</p>
  </template>
</template>

<script setup lang="ts">
import AddUsersDialog from '~/components/Admin/AddUsersDialog.vue';
import { useAdminData } from '~/hooks/adminData';

const adminStore = useAdminStore();
const route = useRoute('/admin/game/[id]');
const currentGame = computed(() => adminStore.games.find((game) => game.game_id.toString() === route.params.id));

const addUsersModal = ref<typeof AddUsersDialog | null>(null);
const isGameInProgress = computed(() => currentGame.value?.game_state !== 'finished');
const currentGameData = ref<ReturnType<typeof useAdminData> | undefined>(undefined);

const displayActionMenu = computed(
  () => currentGame.value?.game_state !== 'finished' && !route.fullPath.includes('presentation'),
);

watch(
  () => currentGame.value,
  (newGame, oldGame) => {
    if (newGame === undefined || (oldGame !== undefined && newGame.game_id === oldGame.game_id)) return;
    currentGameData.value = useAdminData(newGame.game_id, newGame.config, newGame.game_state !== 'finished');
  },
  { immediate: true },
);

provide('addUsersModal', addUsersModal);
provide('currentGame', currentGame);
provide('isGameInProgress', isGameInProgress);
provide('currentGameData', currentGameData!);
</script>

<style scoped lang="postcss">
p {
  max-width: 60ch;
  text-wrap: balance;
}

.admin-action-menu {
  align-self: center;
}
</style>
