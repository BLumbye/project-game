import { defineStore } from 'pinia';
import { collections } from '~/pocketbase';
import { User } from '~/types/types';

export const useAdminStore = defineStore('admin', () => {
  const gameStore = useGameStore();

  // State
  const users = ref<User[]>([]);

  // Getters

  // Actions
  function startGame() {
    if (gameStore.synchronized) return;
    collections.settings.update(gameStore.settingsRecordID!, {
      synchronized: true,
      bids_accepted: false,
      current_week: 0,
      game_id: gameStore.gameID! + 1,
    });
  }

  // function getUsers() {
  //   collections.users.subscribe
  // }

  return { startGame };
});
