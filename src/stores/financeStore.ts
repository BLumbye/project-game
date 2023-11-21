import { defineStore } from 'pinia';
import config from '../config';
import { createWeeklyTimeline, sumReducer } from '../utils/timeline';
import { ClientResponseError } from 'pocketbase';
import { collections, pocketbase, updateExistingOrCreate } from '~/pocketbase';

export const useFinanceStore = defineStore('finance', () => {
  const gameStore = useGameStore();
  const bidStore = useBidStore();
  const workersStore = useWorkersStore();
  const equipmentStore = useEquipmentStore();
  const activityStore = useActivitiesStore();

  // State
  const loading = ref(true);
  //Timelines keep track of the finance through the weeks.
  const incomingTimeline = createWeeklyTimeline('incomingTimeline', 0, sumReducer, 0);
  const workersTimeline = createWeeklyTimeline('workersTimeline', 0, sumReducer, 0);
  const equipmentTimeline = createWeeklyTimeline('equipmentTimeline', 0, sumReducer, 0);
  const overheadTimeline = createWeeklyTimeline('overheadTimeline', 0, sumReducer, 0);
  const consumablesTimeline = createWeeklyTimeline('consumablesTimeline', 0, sumReducer, 0);
  const delayPenaltyTimeline = createWeeklyTimeline('delayPenaltyTimeline', 0, sumReducer, 0);
  const loanInterestTimeline = createWeeklyTimeline('loanInterestTimeline', 0, sumReducer, 0);
  const overdraftInterestTimeline = createWeeklyTimeline('overdraftInterestTimeline', 0, sumReducer, 0);
  const loanRepayTimeline = createWeeklyTimeline('loanRepayTimeline', 0, sumReducer, 0);
  const loanTimeline = createWeeklyTimeline('loanTimeline', 0, sumReducer, 0);

  // Getters
  const outgoingAtWeek = computed(() => {
    return (week?: number) => {
      week ??= gameStore.week - 1;
      return (
        workersTimeline.getReduced.value(week) +
        equipmentTimeline.getReduced.value(week) +
        overheadTimeline.getReduced.value(week) +
        consumablesTimeline.getReduced.value(week) +
        delayPenaltyTimeline.getReduced.value(week) +
        loanInterestTimeline.getReduced.value(week) +
        overdraftInterestTimeline.getReduced.value(week)
      );
    };
  });

  const loanAtWeek = computed(() => {
    return (week?: number) => {
      week ??= gameStore.week - 1;
      return (
        loanTimeline.getReduced.value(week) +
        loanInterestTimeline.getReduced.value(week) -
        loanRepayTimeline.getReduced.value(week)
      );
    };
  });

  const balanceAtWeek = computed(() => {
    return (week?: number) => {
      week ??= gameStore.week - 1;
      return incomingTimeline.getReduced.value(week) + loanAtWeek.value(week) - outgoingAtWeek.value(week);
    };
  });

  const weeklyBalanceAtWeek = computed(() => {
    return (week?: number) => {
      week ??= gameStore.week - 1;
      return (
        (incomingTimeline.get.value(week) || 0) +
        (loanTimeline.get.value(week) || 0) -
        (workersTimeline.get.value(week) || 0) -
        (equipmentTimeline.get.value(week) || 0) -
        (overheadTimeline.get.value(week) || 0) -
        (consumablesTimeline.get.value(week) || 0) -
        (delayPenaltyTimeline.get.value(week) || 0) -
        (loanInterestTimeline.get.value(week) || 0) -
        (overdraftInterestTimeline.get.value(week) || 0) -
        (loanRepayTimeline.get.value(week) || 0)
      );
    };
  });

  const loan = computed(() => loanAtWeek.value());
  const hasActiveLoan = computed(() => {
    return (week?: number) => {
      week ??= gameStore.week;
      return Math.abs(loanAtWeek.value(week)).toFixed(2) !== '0.00';
    };
  });

  // Actions
  /**
   * Adds the value of a Loan to the Loan timeline for the given week.
   * If no week is given, it is added to the next week.
   */
  function takeLoan(value: number, week?: number) {
    week ??= gameStore.week;
    if (hasActiveLoan.value()) return;
    loanTimeline.set(value, week + 1);
  }

  /**
   * Adds interest increase to the interest timeline for the given week.
   * If no week is given, it is added to the current week.
   */
  function addInterestToLoan(value: number, week?: number) {
    week ??= gameStore.week + 1;
    loanInterestTimeline.set(value, week);
  }

  /**
   * Adds money spent on repaying a loan payments to the loanRepay timeline for the given week.
   * If no week is given, it is added to the current week.
   */
  function repayLoan(value: string, week?: number) {
    week ??= gameStore.week;
    let numberValue = Number(value);
    if (/^[0-9]{1,3}%$/.test(value)) {
      numberValue = (Number(value.slice(0, -1)) / 100) * loanAtWeek.value(week);
    }
    if (isNaN(numberValue)) return;
    numberValue = Math.max(0, Math.min(numberValue, loanAtWeek.value(week)));
    loanRepayTimeline.set(numberValue, week + 1);
  }

  function applyWeeklyFinances() {
    if (gameStore.week === 0) {
      incomingTimeline.set(bidStore.price * config.startBudget, 0);
    }

    // Worker pay
    const previousWorkers = workersStore.workersAtWeek(gameStore.week);
    workersTimeline.set(
      previousWorkers.labour * config.labourPay +
        previousWorkers.skilled * config.skilledPay +
        previousWorkers.electrician * config.electricianPay,
    );

    // Equipment costs
    const previousEquipment = equipmentStore.equipmentAtWeek(gameStore.week - 1);
    const equipment = equipmentStore.equipmentAtWeek(gameStore.week);
    let equipmentCost = 0;
    if (equipment.steelwork.status === 'ordered' && previousEquipment.steelwork.status !== 'ordered') {
      equipmentCost +=
        equipment.steelwork.deliveryType! === 'regular'
          ? config.equipmentCost[0]
          : config.equipmentCost[0] * config.expressMultiplier;
    }
    if (equipment.interior.status === 'ordered' && previousEquipment.interior.status !== 'ordered') {
      equipmentCost +=
        equipment.interior.deliveryType! === 'regular'
          ? config.equipmentCost[1]
          : config.equipmentCost[1] * config.expressMultiplier;
    }
    if (equipment.tbs.status === 'ordered' && previousEquipment.tbs.status !== 'ordered') {
      equipmentCost +=
        equipment.tbs.deliveryType! === 'regular'
          ? config.equipmentCost[2]
          : config.equipmentCost[2] * config.expressMultiplier;
    }
    equipmentTimeline.set(equipmentCost);

    // Overhead charge
    overheadTimeline.set(config.overhead);

    // Consumables charge: charge only if any workers are working
    const consumables = activityStore
      .activitiesAtWeek(gameStore.week)
      .some(
        (activity) =>
          activity.requirements.workers !== undefined &&
          Object.values(activity.requirements.workers).some((worker) => worker !== undefined && worker !== 0) &&
          activityStore.workerRequirementMet(activity, gameStore.week),
      );
    consumablesTimeline.set(consumables ? config.consumables : 0, gameStore.week + 1);

    // Project delayed penalty
    delayPenaltyTimeline.set(gameStore.week > bidStore.promisedDuration ? config.projectDelayPenalty : 0);

    //Loan increase
    addInterestToLoan(
      hasActiveLoan.value(gameStore.week + 1)
        ? config.loanInterest *
            (loanAtWeek.value(gameStore.week + 1) - (loanInterestTimeline.get.value(gameStore.week + 1) || 0))
        : 0,
    );

    //Overdraft
    overdraftInterestTimeline.set(
      balanceAtWeek.value(gameStore.week) < 0 ? config.overdraftInterest * -balanceAtWeek.value(gameStore.week) : 0,
    );

    if (gameStore.synchronized) updateDatabase();
  }

  // Logic

  //When the week progresses all finance timelines are updated
  watch(
    () => gameStore.ready,
    () => {
      if (gameStore.ready) {
        applyWeeklyFinances();
      }
    },
  );

  /** When the milestone activity is completed, the the milestone payment is added to the incoming timeline only once */
  watch(
    () => activityStore.weekActivityDone,
    (newDone, oldDone) => {
      if (oldDone[config.milestoneActivity] && !newDone[config.milestoneActivity]) {
        incomingTimeline.add(-bidStore.price * config.milestoneReward, oldDone[config.milestoneActivity]);
      } else if (!oldDone[config.milestoneActivity] && newDone[config.milestoneActivity]) {
        incomingTimeline.add(bidStore.price * config.milestoneReward, newDone[config.milestoneActivity]);
      }
    },
  );

  /**
   * When all activites are completed, the completion payment is added to the incoming timeline.
   */
  const stopFinishedWatcher = watch(
    () => activityStore.allActivitiesDone(),
    (finishedNow, finishedBefore) => {
      if (!finishedBefore && finishedNow) {
        incomingTimeline.add(bidStore.price * config.allActivitesCompleteReward, gameStore.week);
      } else if (finishedBefore && !finishedNow) {
        incomingTimeline.add(-bidStore.price * config.allActivitesCompleteReward, gameStore.week);
      }
    },
  );

  const timelines = {
    incomingTimeline,
    workersTimeline,
    equipmentTimeline,
    overheadTimeline,
    consumablesTimeline,
    delayPenaltyTimeline,
    loanInterestTimeline,
    overdraftInterestTimeline,
    loanRepayTimeline,
    loanTimeline,
  };

  async function connectWithDatabase() {
    // DISABLED
    loading.value = false;
    return;

    if (!gameStore.synchronized || !pocketbase.authStore.isValid || pocketbase.authStore.model!.admin) {
      loading.value = false;
      return;
    }

    // Get existing finances from database
    try {
      const records = await collections.finance.getFullList({
        filter: `user.username="${pocketbase.authStore.model!.username}"`,
      });
      for (let record of records) {
        timelines[record.timeline as keyof typeof timelines].set(record.value, record.week);
      }
    } catch (error) {
      if (!(error instanceof ClientResponseError) || error.status !== 404) {
        throw error;
      }
    }

    loading.value = false;
  }

  async function updateDatabase() {
    if (
      !gameStore.synchronized ||
      !pocketbase.authStore.isValid ||
      pocketbase.authStore.model!.admin ||
      gameStore.stopUpdates
    ) {
      loading.value = false;
      return;
    }

    Object.keys(timelines).forEach((timelineName) => {
      const week = [loanInterestTimeline, loanRepayTimeline, loanTimeline].includes(
        timelines[timelineName as keyof typeof timelines],
      )
        ? gameStore.week + 1
        : gameStore.week;
      updateExistingOrCreate(
        collections.finance,
        `user.username="${pocketbase.authStore.model!.username}" && week=${week} && timeline="${timelineName}"`,
        {
          user: pocketbase.authStore.model!.id,
          game_id: gameStore.gameID,
          week,
          timeline: timelineName,
          value: timelines[timelineName as keyof typeof timelines].get.value(week) || 0,
        },
      );
    });
  }

  if (gameStore.settingsLoaded) {
    connectWithDatabase();
  } else {
    const synchronizedWatcher = watch(
      () => gameStore.settingsLoaded,
      () => {
        if (gameStore.settingsLoaded) {
          synchronizedWatcher();
          connectWithDatabase();
        }
      },
    );
  }

  return {
    loading,
    incomingTimeline,
    workersTimeline,
    equipmentTimeline,
    overheadTimeline,
    consumablesTimeline,
    delayPenaltyTimeline,
    loanInterestTimeline,
    overdraftInterestTimeline,
    loanRepayTimeline,
    loanTimeline,
    outgoingAtWeek,
    loanAtWeek,
    balanceAtWeek,
    weeklyBalanceAtWeek,
    loan,
    hasActiveLoan,
    takeLoan,
    repayLoan,
    applyWeeklyFinances,
    connectWithDatabase,
    updateDatabase,
  };
});
