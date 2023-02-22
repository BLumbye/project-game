<template>
  <div class="loan">
    <h3 class="component-title">Bank loan</h3>
    <!-- header, css, fysisk title -->
    <label for="new-loan-input" class="loan-label">New loan:</label>
    <input type="number" class="loan-input" name="new-loan-input" />
    <label for="repay-input" class="loan-label">Repay amount:</label>
    <input type="number" class="loan-input" name="repay-input" />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="postcss">
.loan {
  display: grid;
  grid-template-columns: repeat(2, auto);
  grid-template-rows: repeat(3, auto);
}

.component-title {
  grid-column: span 2;
}

.loan-label {
  text-align: right;
  font-weight: bold;
}
</style>
