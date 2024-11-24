import { saveAs } from 'file-saver';
import { defineStore } from 'pinia';
import { ClientResponseError } from 'pocketbase';
import config from '~/config';
import { collections, Games } from '~/pocketbase';
import { generatePassword } from '~/utils/passwordGenerator';

export const useAdminStore = defineStore('admin', () => {
  const router = useRouter();

  // State
  const games = ref<Games[]>([]);

  // Getters
  const newestGame = computed(() => {
    if (games.value.length === 0) return undefined;
    return games.value.sort((a, b) => b.game_id - a.game_id)[0];
  });

  const gameByID = computed(() => (gameID: number) => games.value.find((game) => game.game_id === gameID));

  // Actions
  async function fetchGames() {
    (await collections.games.getFullList()).forEach((game) => {
      games.value = [
        ...games.value,
        {
          id: game.id,
          game_id: game.game_id,
          current_week: game.current_week,
          game_state: game.game_state,
          config: game.config,
        },
      ];
    });

    collections.games.subscribe('*', (data) => {
      if (data.action === 'update') {
        const game = games.value.find((game) => game.id === data.record.id)!;
        game.current_week = data.record.current_week;
        game.game_state = data.record.game_state;
        game.config = data.record.config;
        games.value = [...games.value];
      } else if (data.action === 'create') {
        games.value = [
          ...games.value,
          {
            id: data.record.id,
            game_id: data.record.game_id,
            current_week: data.record.current_week,
            game_state: data.record.game_state,
            config: data.record.config,
          },
        ];
      }
    });
  }

  async function createGame() {
    const newGameID = newestGame.value!.game_id + 1;
    await collections.games.create({
      game_id: newGameID,
      current_week: 0,
      game_state: 'adding_users',
      config,
    });
    router.push(`/admin/game/${newGameID}/users`);
  }

  function startAcceptingBids(gameID: number) {
    const game = gameByID.value(gameID);
    if (game === undefined) throw new Error('Game not found');
    collections.games.update(game.id, { game_state: 'getting_bids' });
    router.push(`/admin/game/${game.id}/bids`);
  }

  function stopAcceptingBids(gameID: number) {
    const game = gameByID.value(gameID);
    if (game === undefined) throw new Error('Game not found');
    collections.games.update(game.id, { game_state: 'reviewing_bids' });
  }

  function startGame(gameID: number) {
    const game = gameByID.value(gameID);
    if (game === undefined) throw new Error('Game not found');
    collections.games.update(game.id, { game_state: 'in_progress' });
    router.push(`/admin/game/${game.id}/game-progress`);
  }

  function progressWeek(gameID: number) {
    const game = gameByID.value(gameID);
    if (game === undefined) throw new Error('Game not found');
    collections.games.update(game.id, { current_week: game.current_week + 1 });
  }

  function finishGame(gameID: number) {
    const game = gameByID.value(gameID);
    if (game === undefined) throw new Error('Game not found');
    collections.games.update(game.id, { game_state: 'finished' });
    router.push(`/admin/game/${game.id}/results`);
  }

  function stopGameSession(gameID: number) {
    const game = gameByID.value(gameID);
    if (game === undefined) throw new Error('Game not found');
    collections.games.update(game.id, { synchronized: false });
  }

  async function addUsers(gameID: number, usernames: string[]) {
    const game = gameByID.value(gameID);
    if (game === undefined) throw new Error('Game not found');
    if (usernames.some((username) => username.length < 3)) return 'Usernames must be at least 3 characters long';
    if (usernames.length === 0) return 'You must enter one or more usernames';

    const usernamePassword: Record<(typeof usernames)[number], string> = {};

    await Promise.all(
      usernames.map(async (username) => {
        const password = generatePassword(8);
        try {
          await collections.users.create({
            username,
            password,
            passwordConfirm: password,
            verified: true,
            game_id: gameID,
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

  function updateBid(bidID: string, value: number) {
    collections.bids.update(bidID, { revised_price: value });
  }

  fetchGames();

  return {
    games,
    newestGame,
    createGame,
    startAcceptingBids,
    stopAcceptingBids,
    startGame,
    progressWeek,
    finishGame,
    stopGameSession,
    addUsers,
    updateBid,
  };
});
