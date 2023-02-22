<script setup lang="ts">
import Bid from './components/Bid.vue';
import Workers from './components/Workers.vue';
import Equipment from './components/Equipment.vue';
import Loan from './components/Loan.vue';
import Funds from './components/Funds.vue';
import Allocation from './components/Allocation.vue';
import NextWeek from './components/NextWeek.vue';
</script>

<template>
  <!-- <Bid /> -->
  <div class="week-display">
    <span>Current week: 0</span>
    <span>Decision form: 1</span>
  </div>
  <Workers />
  <Equipment />
  <Allocation />
  <Loan />
  <Funds />
  <NextWeek /> 
</template>