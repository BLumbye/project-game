<template>
  <div class="funds">
    <span>Current money: {{ financeStore.balance }} €</span>
    <span>Current money spent: {{ financeStore.outgoing }} €</span>
    <span>Current loan: {{ financeStore.loan }} €</span>
  </div>
</template>

<script setup lang="ts">
import { useFinanceStore } from '../stores/financeStore';

const financeStore = useFinanceStore();
</script>

<style scoped lang="postcss">
.funds {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>