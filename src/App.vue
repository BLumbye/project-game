<script setup lang="ts">
import Bid from './components/Bid.vue';
import Workers from './components/Workers.vue';
import Equipment from './components/Equipment.vue';
import Loan from './components/Loan.vue';
import Funds from './components/Funds.vue';
import Allocation from './components/Allocation.vue';
import NextWeek from './components/NextWeek.vue';
import { useWeekStore } from './stores/weekStore';

const weekStore = useWeekStore();
</script>

<template>
  <div class="container">

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


<style scoped lang="postcss">
.week-display {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1em;
}

.allocation,
.next-week-button {
  grid-column: span 2;
}
</style>