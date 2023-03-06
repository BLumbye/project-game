<template>
  <div class="funds">
    <span>Current money: {{ financeStore.balance.toFixed(0) }} €</span>
    <span>Current money spent: {{ financeStore.outgoing.toFixed(0) }} €</span>
    <span>Current loan: {{ financeStore.loan.toFixed(0) }} €</span>
  </div>
</template>

<script setup lang="ts">
import { useFinanceStore } from '../../stores/financeStore';

const financeStore = useFinanceStore();
</script>

<style scoped lang="postcss">
.funds {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>