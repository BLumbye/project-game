import { defineStore } from 'pinia';
import { ClientResponseError } from 'pocketbase';
import { saveAs } from 'file-saver';
import { collections, isAdmin } from '~/pocketbase';
import { User, Bid, SurveyAnswer, AdminGameState, DeliveryType, ConfigActivity, GameSummary } from '~/types/types';
import { generatePassword } from '~/utils/passwordGenerator';
import config from '~/config';
import { sumReducer } from '~/utils/timeline';

const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export const useAdminStore = defineStore('admin', () => {
  const gameStore = useGameStore();

  // State
  const users = ref<User[]>([]);
  const bids = ref<Bid[]>([]);
  const surveyAnswers = ref<SurveyAnswer[]>([]);
  const readyStatus = ref<Partial<Record<string, { ready: boolean; week: number }>>>({});
  const gameSummaries = ref<GameSummary[]>([]);
  const userProgress = ref<Partial<Record<string, number[]>>>({});

  // Getters
  const gameStates = computed<AdminGameState[]>(() => {
    const gameStates: AdminGameState[] = [];
    users.value.forEach((user) => {
      const summary = gameSummaries.value.find((summary) => summary.userID === user.id);
      let status: AdminGameState['status'] = summary?.status ?? 'not_started';
      if (readyStatus.value[user.id] !== undefined && readyStatus.value[user.id]!.week < gameStore.week - 1)
        status = 'disconnected';
      const progress = userProgress.value[user.id]?.slice(0, gameStore.week - 1).findLast((val) => val !== 0) ?? 0;
      const ready = (readyStatus.value[user.id]?.ready ?? false) && readyStatus.value[user.id]?.week === gameStore.week;
      gameStates.push({
        userID: user.id,
        status,
        progress,
        ready,
      });
    });
    return gameStates;
  });

  // Actions
  async function createGame() {
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
    fetchSurveyAnswers();
    fetchGameInformation();
  }

  function startAcceptingBids() {
    collections.settings.update(gameStore.settingsRecordID!, { game_state: 'getting_bids' });
  }

  function stopAcceptingBids() {
    collections.settings.update(gameStore.settingsRecordID!, { game_state: 'reviewing_bids' });
  }

  function startGame() {
    collections.settings.update(gameStore.settingsRecordID!, { game_state: 'in_progress' });
  }

  function progressWeek() {
    collections.settings.update(gameStore.settingsRecordID!, { current_week: gameStore.week + 1 });
  }

  function finishGame() {
    collections.settings.update(gameStore.settingsRecordID!, { game_state: 'finished' });
  }

  function stopGameSession() {
    collections.settings.update(gameStore.settingsRecordID!, { synchronized: false });
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

  async function fetchSurveyAnswers() {
    (await collections.surveyAnswers.getFullList({ filter: `game_id=${gameStore.gameID}` })).forEach((answer) => {
      surveyAnswers.value = [
        ...surveyAnswers.value,
        {
          id: answer.id,
          userID: answer.user,
          projectType: answer.project_type,
          caseIndustry: answer.case_industry,
          location: answer.location,
          profitConfidence: answer.profit_confidence,
          timeConfidence: answer.time_confidence,
          topPerformerConfidence: answer.top_performer_confidence,
          projectAbility: answer.project_ability,
          projectKnowledge: answer.project_knowledge,
          superiorKnowledge: answer.superior_knowledge,
        },
      ];
    });

    collections.surveyAnswers.subscribe('*', (data) => {
      if (data.record.game_id !== gameStore.gameID) return;
      if (data.action === 'update') {
        const answer = surveyAnswers.value.find((answer) => answer.id === data.record.id)!;
        answer.projectType = data.record.project_type;
        answer.caseIndustry = data.record.case_industry;
        answer.location = data.record.location;
        answer.profitConfidence = data.record.profit_confidence;
        answer.timeConfidence = data.record.time_confidence;
        answer.topPerformerConfidence = data.record.top_performer_confidence;
        answer.projectAbility = data.record.project_ability;
        answer.projectKnowledge = data.record.project_knowledge;
        answer.superiorKnowledge = data.record.superior_knowledge;
        surveyAnswers.value = [...surveyAnswers.value];
      } else if (data.action === 'create') {
        surveyAnswers.value = [
          ...surveyAnswers.value,
          {
            id: data.record.id,
            userID: data.record.user,
            projectType: data.record.project_type,
            caseIndustry: data.record.case_industry,
            location: data.record.location,
            profitConfidence: data.record.profit_confidence,
            timeConfidence: data.record.time_confidence,
            topPerformerConfidence: data.record.top_performer_confidence,
            projectAbility: data.record.project_ability,
            projectKnowledge: data.record.project_knowledge,
            superiorKnowledge: data.record.superior_knowledge,
          },
        ];
      }
    });
  }

  async function fetchGameInformation() {
    // Ready status
    (await collections.ready.getFullList({ filter: `game_id=${gameStore.gameID}` })).forEach((record) => {
      readyStatus.value = { ...readyStatus.value, [record.user]: { ready: record.ready, week: record.week } };
    });

    collections.ready.subscribe('*', (data) => {
      if (data.record.game_id !== gameStore.gameID) return;
      if (data.action === 'update' || data.action === 'create') {
        readyStatus.value = {
          ...readyStatus.value,
          [data.record.user]: { ready: data.record.ready, week: data.record.week },
        };
      }
    });

    // Game summaries
    function createSummary(data: any) {
      gameSummaries.value = [
        ...gameSummaries.value,
        {
          id: data.id,
          userID: data.user,
          totalBalance: data.total_balance,
          totalLoaned: data.total_loaned,
          totalRepaid: data.total_repaid,
          status: data.status,
        },
      ];
    }

    (await collections.gameSummary.getFullList({ filter: `game_id=${gameStore.gameID}` })).forEach((record) => {
      createSummary(record);
    });

    collections.gameSummary.subscribe('*', (data) => {
      if (data.record.game_id !== gameStore.gameID) return;
      if (data.action === 'update') {
        const summary = gameSummaries.value.find((summary) => summary.id === data.record.id)!;
        summary.userID = data.record.user;
        summary.totalBalance = data.record.total_balance;
        summary.totalLoaned = data.record.total_loaned;
        summary.totalRepaid = data.record.total_repaid;
        summary.status = data.record.status;
        gameSummaries.value = [...gameSummaries.value];
      } else if (data.action === 'create') {
        createSummary(data.record);
      }
    });

    // Total progress
    function updateProgress(data: any) {
      if (userProgress.value[data.user] === undefined) {
        userProgress.value = { ...userProgress.value, [data.user]: Array(config.duration + 1).fill(0) };
        userProgress.value[data.user]![data.week] = data.progress;
      } else {
        userProgress.value[data.user]![data.week] = data.progress;
        userProgress.value = { ...userProgress.value };
      }
    }

    (await collections.totalProgress.getFullList({ filter: `game_id=${gameStore.gameID}` })).forEach((record) => {
      updateProgress(record);
    });

    collections.totalProgress.subscribe('*', (data) => {
      if (data.record.game_id !== gameStore.gameID) return;
      if (data.action === 'update' || data.action === 'create') {
        updateProgress(data.record);
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

  function updateBid(bidID: string, value: number) {
    collections.bids.update(bidID, { revised_price: value });
  }

  if (gameStore.settingsLoaded && gameStore.synchronized && isAdmin()) {
    fetchUsers();
    fetchBids();
    fetchSurveyAnswers();
    fetchGameInformation();
  } else {
    const settingsWatcher = watch(
      () => gameStore.settingsLoaded,
      () => {
        settingsWatcher();
        if (gameStore.synchronized && isAdmin()) {
          fetchUsers();
          fetchBids();
          fetchSurveyAnswers();
          fetchGameInformation();
        }
      },
    );
  }

  return {
    users,
    bids,
    surveyAnswers,
    gameStates,
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
