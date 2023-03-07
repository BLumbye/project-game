<template>
  <div class="decision-form">
    <h2 class="boxed section-title">Decision form for week: {{ weekStore.decisionForm }}</h2>
    <Bid class="bid boxed" />
    <Workers class="workers boxed" />
    <Equipment class="equipment boxed" />
    <Allocation class="allocation boxed" />
    <Loan class="loan boxed" />
    <NextWeek class="next-week-button"
              @week-progressed="weekStore.nextWeek()" />
  </div>
</template>

<script setup lang="ts">
import Bid from './Bid.vue';
import Workers from './Workers.vue';
import Equipment from './Equipment.vue';
import Loan from './Loan.vue';
import Allocation from './Allocation.vue';
import NextWeek from './NextWeek.vue';
import { useWeekStore } from '../../stores/weekStore';

const weekStore = useWeekStore();
</script>

<style scoped lang="postcss">
.week-display {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.decision-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1em;
  overflow: auto;
  max-height: 100%;

  .section-title {
    grid-column: span 2;
  }
}

.allocation,
.next-week-button,
.bid,
.loan {
  grid-column: span 2;
}
</style>