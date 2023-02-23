<template>
  <div class="workers">
    <h3 class="component-title">Hire or fire workers</h3>
    <!-- header, css, fysisk title -->
    <span class="workers-column-label">Worker</span>
    <span class="workers-column-label">Amount</span>
    <label for="labour-input" class="worker-label">Labour</label>
    <input type="number" class="worker-input" name="labour-input" />
    <label for="skilled-input" class="worker-label">Skilled</label>
    <input type="number" class="worker-input" name="skilled-input" />
    <label for="electrician-input" class="worker-label">Electrician</label>
    <input type="number" class="worker-input" name="electrician-input" />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="postcss">
.workers {
  display: grid;
  grid-template-columns: repeat(2, auto);
  grid-template-rows: repeat(5, auto);
}

.component-title {
  grid-column: span 2;
}

.worker-label {
  text-align: left;
}
</style>
