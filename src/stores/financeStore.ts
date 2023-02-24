import { defineStore } from 'pinia';
import { computed, Ref, ref } from 'vue';
import { useWeekStore } from './weekStore';

export const useFinanceStore = defineStore('finance', () => {
  const weekStore = useWeekStore();

  // State
  const incomingTimeline = ref([0]);
  const outgoingTimeline = ref([0]);
  const loanTimeline = ref([0]);

  // Getters
  const statusAtWeek = computed(() => {
    return (timeline: Ref<number[]>, week?: number) => {
      week ??= weekStore.week;
      return timeline.value.slice(0, week).reduce((accumulator, current) => accumulator + current, 0);
    };
  });
  const incoming = computed(() => statusAtWeek.value(incomingTimeline));
  const outgoing = computed(() => statusAtWeek.value(outgoingTimeline));
  const loan = computed(() => statusAtWeek.value(loanTimeline));
  const balance = computed(() => incoming.value + loan.value + outgoing.value);

  // Actions
  function populateTimeline(timeline: Ref<number[]>) {
    for (let i = timeline.value.length; i <= weekStore.week; i++) {
      timeline.value.push(0);
    }
  }

  function addIncoming(value: number) {
    populateTimeline(incomingTimeline);
    incomingTimeline.value[weekStore.week] += value;
  }

  function addOutgoing(value: number) {
    populateTimeline(outgoingTimeline);
    outgoingTimeline.value[weekStore.week] += value;
  }

  function takeLoan(value: number) {
    populateTimeline(loanTimeline);
    loanTimeline.value[weekStore.week] = value;
  }

  function repayLoan(value: number) {
    populateTimeline(loanTimeline);
    loanTimeline.value[weekStore.week] = Math.min(value, loan.value);
  }

  return {
    incomingTimeline,
    outgoingTimeline,
    loanTimeline,
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
