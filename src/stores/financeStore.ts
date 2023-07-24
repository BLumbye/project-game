import { defineStore } from 'pinia';
import config from '../config';
import { createWeeklyTimeline, sumReducer } from '../utils/timeline';

export const useFinanceStore = defineStore('finance', () => {
  const gameStore = useGameStore();
  const bidStore = useBidStore();
  const workersStore = useWorkersStore();
  const equipmentStore = useEquipmentStore();
  const activityStore = useActivitiesStore();

  // State

  //Timelines keep track of the finance through the weeks.
  const incomingTimeline = createWeeklyTimeline(0, sumReducer, 0);
  incomingTimeline.set(bidStore.bidPrice * config.startBudget, 0);   //Set the starting budget
  const workersTimeline = createWeeklyTimeline(0, sumReducer, 0);
  const equipmentTimeline = createWeeklyTimeline(0, sumReducer, 0);
  const overheadTimeline = createWeeklyTimeline(0, sumReducer, 0);
  const consumablesTimeline = createWeeklyTimeline(0, sumReducer, 0);
  const delayPenaltyTimeline = createWeeklyTimeline(0, sumReducer, 0);
  const loanInterestTimeline = createWeeklyTimeline(0, sumReducer, 0);
  const overdraftInterestTimeline = createWeeklyTimeline(0, sumReducer, 0);
  const loanRepayTimeline = createWeeklyTimeline(0, sumReducer, 0);
  const loanTimeline = createWeeklyTimeline(0, sumReducer, 0);

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
      return loanTimeline.getReduced.value(week) - loanRepayTimeline.getReduced.value(week);
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
        2 * (loanInterestTimeline.get.value(week) || 0) -
        (overdraftInterestTimeline.get.value(week) || 0) -
        (loanRepayTimeline.get.value(week) || 0)
      );
    };
  });
  const loan = computed(() => loanAtWeek.value());

  // Actions
  /**
   * Adds the value of a Loan to the Loan timeline for the given week.
   * If no week is given, it is added to the next week.
   */
  function takeLoan(value: number, week?: number) {
    week ??= gameStore.week;
    if(loanTimeline.get.value(gameStore.week-1) || 0 != 0) return; 
    loanTimeline.set(value, week + 1);
  }

  /**
   * Adds interest increase to the interest timeline for the given week.
   * If no week is given, it is added to the current week.
   */
  function addInterestToLoan(value: number, week?: number) {
    week ??= gameStore.week;
    loanTimeline.add(value, week);
    loanInterestTimeline.add(value, week);
  }

  /**
   * Adds money spent on repaying a loan payments to the loanRepay timeline for the given week.
   * If no week is given, it is added to the current week.
   */
  function repayLoan(value: number, week?: number) {
    week ??= gameStore.week;
    value = Math.min(value, loan.value * (1 + config.loanInterest));
    loanRepayTimeline.set(value, week + 1);
  }

  function applyWeeklyFinances() {
    // Worker pay
    const previousWorkers = workersStore.workersAtWeek(gameStore.week - 1);
    workersTimeline.add(
      previousWorkers.labour * config.labourPay +
      previousWorkers.skilled * config.skilledPay +
      previousWorkers.electrician * config.electricianPay,
    );

    // Equipment costs
    const previousEquipment = equipmentStore.equipmentAtWeek(gameStore.week - 2);
    const equipment = equipmentStore.equipmentAtWeek(gameStore.week - 1);
    if (equipment.steelwork.status === 'ordered' && previousEquipment.steelwork.status !== 'ordered') {
      equipmentTimeline.add(equipment.steelwork.deliveryType! === 'regular' ? 38000 : 41800);
    }
    if (equipment.interior.status === 'ordered' && previousEquipment.interior.status !== 'ordered') {
      equipmentTimeline.add(equipment.interior.deliveryType! === 'regular' ? 28000 : 30800);
    }
    if (equipment.tbs.status === 'ordered' && previousEquipment.tbs.status !== 'ordered') {
      equipmentTimeline.add(equipment.tbs.deliveryType! === 'regular' ? 130000 : 143000);
    }

    // Overhead charge
    overheadTimeline.add(config.overhead);

    // Consumables charge: charge only if any workers are working
    if (
      activityStore
        .activitiesAtWeek(gameStore.week - 1)
        .some(
          (activity) =>
            activity.requirements.workers !== undefined &&
            activityStore.workerRequirementMet(activity, gameStore.week - 1),
        )
    ) {
      consumablesTimeline.add(config.consumables);
    }

    // Project delayed penalty
    if (gameStore.week - 1 > bidStore.bidDuration) {
      delayPenaltyTimeline.add(config.projectDelayPenalty);
    }

    //Loan increase
    if (loanAtWeek.value(gameStore.week) > 0) {
      addInterestToLoan(config.loanInterest * loanAtWeek.value(gameStore.week));
    }

    //Overdraft
    if (balanceAtWeek.value(gameStore.week - 1) < 0) {
      overdraftInterestTimeline.add(config.overdraftInterest * -balanceAtWeek.value(gameStore.week - 1));
    }
  }

  // Logic

  //When the week progresses all finance timelines are updated
  watch(
    () => gameStore.week,
    () => {
      applyWeeklyFinances();
    },
  );

  /** When the milestone activity is completed, the the milestone payment is added to the incoming timeline only once
   * */
  const stopMilestoneWatcher = watch(
    () => activityStore.isActivityDone(activityStore.activityFromLabel(config.milestoneActivity)),
    () => {
      if (activityStore.isActivityDone(activityStore.activityFromLabel(config.milestoneActivity))) {
        stopMilestoneWatcher();
        incomingTimeline.add(bidStore.bidPrice * config.milestoneReward, gameStore.week - 1);
      }
    },
  );

  /**
   * When all activites are completed, the completion payment is added to the incoming timeline.
   */
  const stopFinishedWatcher = watch(
    () => activityStore.allActivitiesDone(),
    () => {
      if (activityStore.allActivitiesDone()) {
        stopFinishedWatcher();
        incomingTimeline.add(bidStore.bidPrice * config.allActivitesCompleteReward, gameStore.week - 1);
      }
    },
  );

  return {
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
    takeLoan,
    repayLoan,
  };
});
