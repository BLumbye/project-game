<template>
  <div class="decision-form">
    <Bid class="bid boxed" />
    <div class="week-display boxed">
      <span>Current week: {{ weekStore.week }}</span>
      <span>Decision form: {{ weekStore.decisionForm }}</span>
    </div>
    <Workers class="workers boxed" />
    <Equipment class="equipment boxed" />
    <Allocation class="allocation boxed" />
    <Loan class="loan boxed" />
    <Funds class="funds boxed" />
    <NextWeek class="next-week-button"
              @week-progressed="weekStore.nextWeek()" />
  </div>
</template>

<script setup lang="ts">
import Bid from './Bid.vue';
import Workers from './Workers.vue';
import Equipment from './Equipment.vue';
import Loan from './Loan.vue';
import Funds from './Funds.vue';
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
}

.allocation,
.next-week-button {
  grid-column: span 2;
}
</style>