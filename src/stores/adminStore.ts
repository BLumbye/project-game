import { defineStore } from 'pinia';
import { ClientResponseError } from 'pocketbase';
import { saveAs } from 'file-saver';
import { collections, isAdmin } from '~/pocketbase';
import { User, Bid } from '~/types/types';
import { generatePassword } from '~/utils/passwordGenerator';

const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export const useAdminStore = defineStore('admin', () => {
  const gameStore = useGameStore();

  // State
  const users = ref<User[]>([]);
  const bids = ref<Bid[]>([]);

  // Getters

  // Actions
  async function startGame() {
    if (gameStore.synchronized) return;
    collections.settings.update(gameStore.settingsRecordID!, {
      synchronized: true,
      bids_accepted: false,
      current_week: 0,
      game_id: gameStore.gameID! + 1,
      game_state: 'adding_users',
    });
    gameStore.gameID!++;
    fetchUsers();
    fetchBids();
  }

  function startAcceptingBids() {
    collections.settings.update(gameStore.settingsRecordID!, { game_state: 'getting_bids' });
  }

  function stopAcceptingBids() {
    collections.settings.update(gameStore.settingsRecordID!, { game_state: 'reviewing_bids' });
  }

  function acceptBids() {
    collections.settings.update(gameStore.settingsRecordID!, { game_state: 'in_progress' });
  }

  async function fetchUsers() {
    try {
      (await collections.users.getFullList({ filter: `game_id=${gameStore.gameID}` })).forEach((user) => {
        if (user.admin) return;
        users.value = [...users.value, { id: user.id, username: user.username }];
      });
    } catch (error) {
      if (!(error instanceof ClientResponseError) || error.status !== 400) {
        console.error(error);
      }
    }

    collections.users.subscribe('*', (data) => {
      if (data.record.game_id !== gameStore.gameID) return;
      if (data.action === 'delete') {
        users.value = users.value.filter((user) => user.id !== data.record.id);
      } else if (data.action === 'update') {
        users.value.find((user) => user.id === data.record.id)!.username = data.record.username;
        users.value = [...users.value];
      } else if (data.action === 'create') {
        users.value = [...users.value, { id: data.record.id, username: data.record.username }];
      }
    });
  }

  async function fetchBids() {
    (await collections.bids.getFullList({ filter: `game_id=${gameStore.gameID}` })).forEach((bid) => {
      bids.value = [
        ...bids.value,
        {
          id: bid.id,
          userID: bid.user,
          price: bid.price,
          promisedDuration: bid.promised_duration,
          expectedCost: bid.expected_cost,
          expectedDuration: bid.expected_duration,
          revisedPrice: bid.revised_price,
        },
      ];
    });

    collections.bids.subscribe('*', (data) => {
      if (data.record.game_id !== gameStore.gameID) return;
      if (data.action === 'update') {
        const bid = bids.value.find((bid) => bid.id === data.record.id)!;
        bid.price = data.record.price;
        bid.promisedDuration = data.record.promised_duration;
        bid.expectedCost = data.record.expected_cost;
        bid.expectedDuration = data.record.expected_duration;
        bid.revisedPrice = data.record.revised_price;
        bids.value = [...bids.value];
      } else if (data.action === 'create') {
        bids.value = [
          ...bids.value,
          {
            id: data.record.id,
            userID: data.record.user,
            price: data.record.price,
            promisedDuration: data.record.promised_duration,
            expectedCost: data.record.expected_cost,
            expectedDuration: data.record.expected_duration,
            revisedPrice: data.record.revised_price,
          },
        ];
      }
    });
  }

  async function addUsers(usernameTemplate: string, amount: number) {
    if (!gameStore.synchronized) return 'Game has not been started yet';
    if (!usernameTemplate.includes('#')) return 'Username template must include a "#"';
    if (usernameTemplate.length < 3) return 'Username template must be at least 3 characters long';
    if (amount < 1) return 'Amount must be greater than 0';

    let usersCSV = 'username,password\n';
    const promises = [];

    for (let i = 0; i < amount; i++) {
      const username = usernameTemplate.replace('#', (i + 1).toString());
      const password = generatePassword(8);
      try {
        promises.push(
          (async () => {
            const user = await collections.users.create({
              username,
              password,
              passwordConfirm: password,
              verified: true,
              game_id: gameStore.gameID,
            });
            usersCSV += `${username},${password}\n`;
          })(),
        );
      } catch (error) {
        if (error instanceof ClientResponseError) {
          console.error('error during creation of user', error);
          return error.message;
        } else {
          return 'An unknown error occurred';
        }
      }
    }

    await Promise.all(promises);
    const blob = new Blob([usersCSV], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'users.csv');

    return true;
  }

  function updateBid(
    bidID: string,
    value: number,
    field: 'bidPrice' | 'bidDuration' | 'expectedPrice' | 'expectedDuration',
  ) {
    collections.bids.update(bidID, { [camelToSnakeCase(field)]: value });
  }

  if (gameStore.settingsLoaded && gameStore.synchronized && isAdmin()) {
    if (gameStore.synchronized && isAdmin()) {
      fetchUsers();
      fetchBids();
    }
  } else {
    const settingsWatcher = watch(
      () => gameStore.settingsLoaded,
      () => {
        settingsWatcher();
        if (gameStore.synchronized && isAdmin()) {
          fetchUsers();
          fetchBids();
        }
      },
    );
  }

  return { users, bids, startGame, startAcceptingBids, stopAcceptingBids, acceptBids, addUsers, updateBid };
});
