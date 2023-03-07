import { defineStore } from 'pinia';
import { computed, Ref, ref, watch } from 'vue';
import config from '../config';
import { useActivitiesStore } from './activitiesStore';
import { useBidStore } from './bidStore';
import { useEquipmentStore } from './equipmentStore';
import { useWeekStore } from './weekStore';
import { useWorkersStore } from './workersStore';

export const useFinanceStore = defineStore('finance', () => {
  const weekStore = useWeekStore();
  const bidStore = useBidStore();
  const workersStore = useWorkersStore();
  const equipmentStore = useEquipmentStore();
  const activityStore = useActivitiesStore();

  // State
  const incomingTimeline = ref([bidStore.price * config.startBudget]);
  const workersTimeline = ref([0]);
  const equipmentTimeline = ref([0]);
  const overheadTimeline = ref([0]);
  const consumablesTimeline = ref([0]);
  const delayPenaltyTimeline = ref([0]);
  const loanInterestTimeline = ref([0]);
  const overdraftInterestTimeline = ref([0]);
  const loanPaybackTimeline = ref([0]);
  const loanTimeline = ref([0]);

  // Getters
  const statusAtWeek = computed(() => {
    return (timeline: Ref<number[]>, week?: number) => {
      week ??= weekStore.week;
      return timeline.value.slice(0, week + 1).reduce((accumulator, current) => accumulator + current, 0);
    };
  });
  const workersAtWeek = computed(() => {
    return (week?: number) => {
      week ??= weekStore.week - 1;
      return statusAtWeek.value(workersTimeline, week);
    };
  });
  const equipmentAtWeek = computed(() => {
    return (week?: number) => {
      week ??= weekStore.week - 1;
      return statusAtWeek.value(equipmentTimeline, week);
    };
  });
  const overheadAtWeek = computed(() => {
    return (week?: number) => {
      week ??= weekStore.week - 1;
      return statusAtWeek.value(overheadTimeline, week);
    };
  });
  const consumablesAtWeek = computed(() => {
    return (week?: number) => {
      week ??= weekStore.week - 1;
      return statusAtWeek.value(consumablesTimeline, week);
    };
  });
  const delayPenaltyAtWeek = computed(() => {
    return (week?: number) => {
      week ??= weekStore.week - 1;
      return statusAtWeek.value(delayPenaltyTimeline, week);
    };
  });
  const loanInterestAtWeek = computed(() => {
    return (week?: number) => {
      week ??= weekStore.week - 1;
      return statusAtWeek.value(loanInterestTimeline, week);
    };
  });
  const overdraftInterestAtWeek = computed(() => {
    return (week?: number) => {
      week ??= weekStore.week - 1;
      return statusAtWeek.value(overdraftInterestTimeline, week);
    };
  });
  const loanPaybackAtWeek = computed(() => {
    return (week?: number) => {
      week ??= weekStore.week - 1;
      return statusAtWeek.value(loanPaybackTimeline, week);
    };
  });
  const incomingAtWeek = computed(() => {
    return (week?: number) => {
      week ??= weekStore.week - 1;
      return statusAtWeek.value(incomingTimeline, week);
    };
  });
  const outgoingAtWeek = computed(() => {
    return (week?: number) => {
      week ??= weekStore.week - 1;
      return (
        statusAtWeek.value(workersTimeline, week) +
        statusAtWeek.value(equipmentTimeline, week) +
        statusAtWeek.value(overheadTimeline, week) +
        statusAtWeek.value(consumablesTimeline, week) +
        statusAtWeek.value(delayPenaltyTimeline, week) +
        statusAtWeek.value(loanInterestTimeline, week) +
        statusAtWeek.value(overdraftInterestTimeline, week) +
        statusAtWeek.value(loanPaybackTimeline, week)
      );
    };
  });
  const loanAtWeek = computed(() => {
    return (week?: number) => {
      week ??= weekStore.week - 1;
      return statusAtWeek.value(loanTimeline, week) - statusAtWeek.value(loanPaybackTimeline, week);
    };
  });
  const balanceAtWeek = computed(() => {
    return (week?: number) => {
      week ??= weekStore.week - 1;
      return incomingAtWeek.value(week) + loanAtWeek.value(week) - outgoingAtWeek.value(week);
    };
  });
  const weeklyBalanceAtWeek = computed(() => {
    return (week?: number) => {
      week ??= weekStore.week - 1;
      return (
        (incomingTimeline.value[week] || 0) +
        (loanTimeline.value[week] || 0) -
        (workersTimeline.value[week] || 0) -
        (equipmentTimeline.value[week] || 0) -
        (overheadTimeline.value[week] || 0) -
        (consumablesTimeline.value[week] || 0) -
        (delayPenaltyTimeline.value[week] || 0) -
        2 * (loanInterestTimeline.value[week] || 0) -
        (overdraftInterestTimeline.value[week] || 0) -
        (loanPaybackTimeline.value[week] || 0)
      );
    };
  });
  const incoming = computed(() => incomingAtWeek.value());
  const outgoing = computed(() => outgoingAtWeek.value());
  const loan = computed(() => loanAtWeek.value());
  const balance = computed(() => balanceAtWeek.value());

  // Actions
  function populateTimeline(timeline: Ref<number[]>, week?: number) {
    week ??= weekStore.week;
    for (let i = timeline.value.length; i <= week; i++) {
      timeline.value.push(0);
    }
  }

  function addIncoming(value: number, week?: number) {
    week ??= weekStore.week;
    populateTimeline(incomingTimeline);
    incomingTimeline.value[week] += value;
  }

  function addWorkers(value: number, week?: number) {
    week ??= weekStore.week;
    populateTimeline(workersTimeline);
    workersTimeline.value[week] += value;
  }

  function addEquipment(value: number, week?: number) {
    week ??= weekStore.week;
    populateTimeline(equipmentTimeline);
    equipmentTimeline.value[week] += value;
  }

  function addOverhead(value: number, week?: number) {
    week ??= weekStore.week;
    populateTimeline(overheadTimeline);
    overheadTimeline.value[week] += value;
  }

  function addConsumables(value: number, week?: number) {
    week ??= weekStore.week;
    populateTimeline(consumablesTimeline);
    consumablesTimeline.value[week] += value;
  }

  function addDelayPenalty(value: number, week?: number) {
    week ??= weekStore.week;
    populateTimeline(delayPenaltyTimeline);
    delayPenaltyTimeline.value[week] += value;
  }

  function addOverdraftInterest(value: number, week?: number) {
    week ??= weekStore.week;
    populateTimeline(overdraftInterestTimeline);
    overdraftInterestTimeline.value[week] += value;
  }

  function takeLoan(value: number, week?: number) {
    week ??= weekStore.week;
    populateTimeline(loanTimeline, week + 1);
    loanTimeline.value[week + 1] = value;
  }

  function addInterestToLoan(value: number, week?: number) {
    week ??= weekStore.week;
    populateTimeline(loanTimeline);
    loanTimeline.value[week] += value;
    addLoanInterest(value, week);
  }

  function addLoanInterest(value: number, week?: number) {
    week ??= weekStore.week;
    populateTimeline(loanInterestTimeline);
    loanInterestTimeline.value[week] += value;
  }

  function repayLoan(value: number, week?: number) {
    week ??= weekStore.week;
    value = Math.min(value, loan.value * (1 + config.loanInterest));
    populateTimeline(loanPaybackTimeline, week + 1);
    loanPaybackTimeline.value[week + 1] = value;
  }

  // Logic
  watch(
    () => weekStore.week,
    () => {
      // Worker pay
      const previousWorkers = workersStore.workersAtWeek(weekStore.week - 1);
      addWorkers(
        previousWorkers.labour * config.labourPay +
          previousWorkers.skilled * config.skilledPay +
          previousWorkers.electrician * config.electricianPay,
      );

      // Equipment costs
      const previousEquipment = equipmentStore.equipmentAtWeek(weekStore.week - 2);
      const equipment = equipmentStore.equipmentAtWeek(weekStore.week - 1);
      if (equipment.steelwork.status === 'ordered' && previousEquipment.steelwork.status !== 'ordered') {
        addEquipment(equipment.steelwork.deliveryType! === 'regular' ? 38000 : 41800);
      }
      if (equipment.interior.status === 'ordered' && previousEquipment.interior.status !== 'ordered') {
        addEquipment(equipment.interior.deliveryType! === 'regular' ? 28000 : 30800);
      }
      if (equipment.tbs.status === 'ordered' && previousEquipment.tbs.status !== 'ordered') {
        addEquipment(equipment.tbs.deliveryType! === 'regular' ? 130000 : 143000);
      }

      // Overhead charge
      addOverhead(config.overhead);

      // Consumables charge - charge if any workers are working
      if (
        activityStore
          .activitiesAtWeek(weekStore.week - 1)
          .some(
            (activity) =>
              activity.requirements.workers !== undefined &&
              activityStore.workerRequirementMet(activity, weekStore.week - 1),
          )
      ) {
        addConsumables(config.consumables);
      }

      // Project delayed penalty
      if (weekStore.week - 1 > bidStore.duration) {
        addDelayPenalty(config.projectDelayPenalty);
      }

      //Loan increase
      if (loanAtWeek.value(weekStore.week) > 0) {
        addInterestToLoan(config.loanInterest * loanAtWeek.value(weekStore.week));
      }

      //Overdraft
      if (balanceAtWeek.value(weekStore.week - 1) < 0) {
        addOverdraftInterest(config.overdraftInterest * -balanceAtWeek.value(weekStore.week - 1));
      }
    },
  );

  const stopMilestoneWatcher = watch(
    () => activityStore.isActivityDone(config.milestoneActivity),
    () => {
      if (activityStore.isActivityDone(config.milestoneActivity)) {
        stopMilestoneWatcher();
        addIncoming(bidStore.price * config.milestoneReward, weekStore.week - 1);
      }
    },
  );

  const stopFinishedWatcher = watch(
    () => activityStore.allActivitiesDone(),
    () => {
      if (activityStore.allActivitiesDone()) {
        stopFinishedWatcher();
        addIncoming(bidStore.price * config.allActivitesCompleteReward, weekStore.week - 1);
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
    loanPaybackTimeline,
    loanTimeline,
    workersAtWeek,
    equipmentAtWeek,
    overheadAtWeek,
    consumablesAtWeek,
    delayPenaltyAtWeek,
    loanInterestAtWeek,
    overdraftInterestAtWeek,
    loanPaybackAtWeek,
    incomingAtWeek,
    outgoingAtWeek,
    loanAtWeek,
    balanceAtWeek,
    weeklyBalanceAtWeek,
    incoming,
    outgoing,
    loan,
    balance,
    addIncoming,
    takeLoan,
    repayLoan,
  };
});
