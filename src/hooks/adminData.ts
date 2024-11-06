import { ClientResponseError } from 'pocketbase';
import { collections, EventChoice, GameSummary as PBGameSummary, TotalProgress } from '~/pocketbase';
import { Config } from '~/types/configInterface';
import { User, Bid, SurveyAnswer, AdminGameState, GameSummary } from '~/types/types';

export interface AdminData {
  loading: boolean;
  users: User[];
  bids: Bid[];
  surveyAnswers: SurveyAnswer[];
  readyStatus: Partial<Record<string, { ready: boolean; week: number }>>;
  gameSummaries: GameSummary[];
  userProgress: Partial<Record<string, number[]>>;
  eventChoices: Record<string, Record<string, string>>;
  gameStates: AdminGameState[];
}

export const useAdminData = (gameID: number, config: Config, subscribe: boolean) => {
  const users = ref<User[]>([]);
  const bids = ref<Bid[]>([]);
  const surveyAnswers = ref<SurveyAnswer[]>([]);
  const readyStatus = ref<Partial<Record<string, { ready: boolean; week: number }>>>({});
  const gameSummaries = ref<GameSummary[]>([]);
  const userProgress = ref<Partial<Record<string, number[]>>>({});
  const eventChoices = ref<Record<string, Record<string, string>>>({});
  const loading = ref(true);

  const gameStates = computed<AdminGameState[]>(() => {
    const adminStore = useAdminStore();
    const game = adminStore.games.find((game) => game.game_id === gameID)!;

    const gameStates: AdminGameState[] = [];
    for (let user of users.value) {
      const summary = gameSummaries.value.find((summary) => summary.userID === user.id);
      const status: AdminGameState['status'] = summary?.status ?? 'not_started';
      const progress = userProgress.value[user.id]?.slice(0, game.current_week).findLast((val) => val !== 0) ?? 0;
      const ready =
        (readyStatus.value[user.id]?.ready ?? false) && readyStatus.value[user.id]?.week === game.current_week;
      gameStates.push({
        userID: user.id,
        status,
        progress,
        ready,
        week: summary?.week || 0,
        eventChoices: eventChoices.value[user.id] ?? {},
      });
    }
    return gameStates;
  });

  async function fetchUsers() {
    try {
      (await collections.users.getFullList({ filter: `game_id=${gameID}` })).forEach((user) => {
        if (user.admin) return;
        users.value = [...users.value, { id: user.id, username: user.username }];
      });
    } catch (error) {
      if (!(error instanceof ClientResponseError) || error.status !== 400) {
        console.error(error);
      }
    }

    if (subscribe) {
      collections.users.subscribe('*', (data) => {
        if (data.record.game_id !== gameID) return;
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
  }

  async function fetchBids() {
    (await collections.bids.getFullList({ filter: `game_id=${gameID}` })).forEach((bid) => {
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

    if (subscribe) {
      collections.bids.subscribe('*', (data) => {
        if (data.record.game_id !== gameID) return;
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
  }

  async function fetchSurveyAnswers() {
    (await collections.surveyAnswers.getFullList({ filter: `game_id=${gameID}` })).forEach((answer) => {
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

    if (subscribe) {
      collections.surveyAnswers.subscribe('*', (data) => {
        if (data.record.game_id !== gameID) return;
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
  }

  async function fetchGameInformation() {
    // Ready status
    (await collections.ready.getFullList({ filter: `game_id=${gameID}` })).forEach((record) => {
      readyStatus.value = { ...readyStatus.value, [record.user]: { ready: record.ready, week: record.week } };
    });

    if (subscribe) {
      collections.ready.subscribe('*', (data) => {
        if (data.record.game_id !== gameID) return;
        if (data.action === 'update' || data.action === 'create') {
          readyStatus.value = {
            ...readyStatus.value,
            [data.record.user]: { ready: data.record.ready, week: data.record.week },
          };
        }
      });
    }

    // Game summaries
    function createSummary(data: PBGameSummary) {
      gameSummaries.value = [
        ...gameSummaries.value,
        {
          id: data.id,
          userID: data.user,
          week: data.week,
          totalBalance: data.total_balance,
          totalLoaned: data.total_loaned,
          totalRepaid: data.total_repaid,
          status: data.status,
        },
      ];
    }

    (await collections.gameSummary.getFullList({ filter: `game_id=${gameID}` })).forEach((record) => {
      createSummary(record);
    });

    if (subscribe) {
      collections.gameSummary.subscribe('*', (data) => {
        if (data.record.game_id !== gameID) return;
        if (data.action === 'update') {
          const summary = gameSummaries.value.find((summary) => summary.id === data.record.id)!;
          summary.userID = data.record.user;
          summary.week = data.record.week;
          summary.totalBalance = data.record.total_balance;
          summary.totalLoaned = data.record.total_loaned;
          summary.totalRepaid = data.record.total_repaid;
          summary.status = data.record.status;
          gameSummaries.value = [...gameSummaries.value];
        } else if (data.action === 'create') {
          createSummary(data.record);
        }
      });
    }

    // Total progress
    function updateProgress(data: TotalProgress) {
      if (userProgress.value[data.user] === undefined) {
        userProgress.value = { ...userProgress.value, [data.user]: Array(config.projectDuration + 1).fill(0) };
        userProgress.value[data.user]![data.week] = data.progress;
      } else {
        userProgress.value[data.user]![data.week] = data.progress;
        userProgress.value = { ...userProgress.value };
      }
    }

    (await collections.totalProgress.getFullList({ filter: `game_id=${gameID}` })).forEach((record) => {
      updateProgress(record);
    });

    if (subscribe) {
      collections.totalProgress.subscribe('*', (data) => {
        if (data.record.game_id !== gameID) return;
        if (data.action === 'update' || data.action === 'create') {
          updateProgress(data.record);
        }
      });
    }

    // Event choices
    function updateEventChoice(data: EventChoice) {
      if (eventChoices.value[data.user] === undefined) {
        eventChoices.value = { ...eventChoices.value, [data.user]: { [data.event]: data.choice } };
      } else {
        eventChoices.value = {
          ...eventChoices.value,
          [data.user]: { ...eventChoices.value[data.user], [data.event]: data.choice },
        };
      }
    }

    (await collections.eventChoices.getFullList({ filter: `game_id=${gameID}` })).forEach((record) => {
      updateEventChoice(record);
    });

    if (subscribe) {
      collections.eventChoices.subscribe('*', (data) => {
        if (data.record.game_id !== gameID) return;
        if (data.action === 'update' || data.action === 'create') {
          updateEventChoice(data.record);
        }
      });
    }
  }

  async function fetchData() {
    loading.value = true;
    Promise.all([fetchUsers(), fetchBids(), fetchSurveyAnswers(), fetchGameInformation()]).finally(() => {
      loading.value = false;
    });
  }

  fetchData();

  return {
    loading,
    users,
    bids,
    surveyAnswers,
    readyStatus,
    gameSummaries,
    userProgress,
    eventChoices,
    gameStates,
  };
};
