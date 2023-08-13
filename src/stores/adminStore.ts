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

  function progressWeek() {
    collections.settings.update(gameStore.settingsRecordID!, { current_week: gameStore.week + 1 });
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

  async function addUsers(usernames: string[]) {
    if (!gameStore.synchronized) return 'Game has not been started yet';
    if (usernames.some((username) => username.length < 3)) return 'Usernames must be at least 3 characters long';
    if (usernames.length === 0) return 'You must enter one or more usernames';

    const usernamePassword: Record<(typeof usernames)[number], string> = {};

    await Promise.all(
      usernames.map(async (username) => {
        const password = generatePassword(8);
        try {
          const user = await collections.users.create({
            username,
            password,
            passwordConfirm: password,
            verified: true,
            game_id: gameStore.gameID,
          });
          usernamePassword[username] = password;
        } catch (error) {
          if (error instanceof ClientResponseError) {
            console.error('error during creation of user', error);
            throw error.message;
          } else {
            throw 'An unknown error occurred';
          }
        }
      }),
    ).catch((error) => {
      return error;
    });

    let usersCSV = 'username,password\n';
    usernames.forEach((username) => (usersCSV += `${username},${usernamePassword[username]}\n`));
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

  return {
    users,
    bids,
    startGame,
    startAcceptingBids,
    stopAcceptingBids,
    acceptBids,
    addUsers,
    updateBid,
    progressWeek,
  };
});
