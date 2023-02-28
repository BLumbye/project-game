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
  const incomingTimeline = ref([bidStore.price * 0.2]);
  const outgoingTimeline = ref([0]);
  const loanTimeline = ref([0]);

  // Getters
  const statusAtWeek = computed(() => {
    return (timeline: Ref<number[]>, week?: number) => {
      week ??= weekStore.week;
      return timeline.value.slice(0, week + 1).reduce((accumulator, current) => accumulator + current, 0);
    };
  });
  const incoming = computed(() => statusAtWeek.value(incomingTimeline, weekStore.week - 1));
  const outgoing = computed(() => statusAtWeek.value(outgoingTimeline, weekStore.week - 1));
  const loan = computed(() => statusAtWeek.value(loanTimeline, weekStore.week - 1));
  const balance = computed(() => incoming.value + loan.value - outgoing.value);

  // Actions
  function populateTimeline(timeline: Ref<number[]>) {
    for (let i = timeline.value.length; i <= weekStore.week; i++) {
      timeline.value.push(0);
    }
  }

  function addIncoming(value: number, week?: number) {
    week ??= weekStore.week;
    populateTimeline(incomingTimeline);
    incomingTimeline.value[week] += value;
  }

  function addOutgoing(value: number, week?: number) {
    week ??= weekStore.week;
    populateTimeline(outgoingTimeline);
    outgoingTimeline.value[week] += value;
  }

  function takeLoan(value: number, week?: number) {
    week ??= weekStore.week;
    populateTimeline(loanTimeline);
    loanTimeline.value[week] = value;
  }

  function repayLoan(value: number, week?: number) {
    week ??= weekStore.week;
    populateTimeline(loanTimeline);
    loanTimeline.value[week] = -Math.min(value, loan.value);
  }

  // Logic
  watch(
    () => weekStore.week,
    () => {
      let weeklyOutgoing = 0;

      // Worker pay
      const previousWorkers = workersStore.workersAtWeek(weekStore.week - 1);
      weeklyOutgoing += previousWorkers.labour * 800;
      weeklyOutgoing += previousWorkers.skilled * 1500;
      weeklyOutgoing += previousWorkers.electrician * 2000;

      // Equipment costs
      const previousEquipment = equipmentStore.equipmentAtWeek(weekStore.week - 2);
      const equipment = equipmentStore.equipmentAtWeek(weekStore.week - 1);
      if (equipment.steelwork.status === 'ordered' && previousEquipment.steelwork.status !== 'ordered') {
        weeklyOutgoing += equipment.steelwork.deliveryType! === 'regular' ? 38000 : 41800;
      }
      if (equipment.interior.status === 'ordered' && previousEquipment.interior.status !== 'ordered') {
        weeklyOutgoing += equipment.interior.deliveryType! === 'regular' ? 28000 : 30800;
      }
      if (equipment.tbs.status === 'ordered' && previousEquipment.tbs.status !== 'ordered') {
        weeklyOutgoing += equipment.tbs.deliveryType! === 'regular' ? 130000 : 143000;
      }

      // Overhead charge
      weeklyOutgoing += 10000;

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
        weeklyOutgoing += 50000;
      }

      // Project delayed penalty
      if (weekStore.week > bidStore.duration) {
        weeklyOutgoing += 20000;
      }

      addOutgoing(weeklyOutgoing, weekStore.week - 1);
    },
  );

  const stopMilestoneWatcher = watch(
    () => activityStore.isActivityDone('H'),
    () => {
      if (activityStore.isActivityDone('H')) {
        stopMilestoneWatcher();
        addIncoming(bidStore.price * 0.5, weekStore.week - 1);
      }
    },
  );

  const stopFinishedWatcher = watch(
    () => activityStore.allActivitiesDone(),
    () => {
      if (activityStore.allActivitiesDone()) {
        stopFinishedWatcher();
        addIncoming(bidStore.price * 0.3, weekStore.week - 1);
      }
    },
  );

  return {
    incoming,
    outgoing,
    loan,
    balance,
    addIncoming,
    addOutgoing,
    takeLoan,
    repayLoan,
  };
});
