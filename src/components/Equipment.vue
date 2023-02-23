<template>
  <div class="equipment">
    <h3 class="component-title">Order equipment</h3>
    <!-- header, css, fysisk title -->
    <span class="equipment-column-label">Equipment</span>
    <span class="equipment-column-label">Order</span>
    <label for="steelwork-input" class="equipment-label">Steelwork (Task A)</label>
    <input type="number" class="equipment-input" name="steelwork-input" />
    <label for="interior-input" class="equipment-label">Interior (Task B)</label>
    <input type="number" class="equipment-input" name="interior-input" />
    <label for="tbs-input" class="equipment-label">TBS (Task C)</label>
    <input type="number" class="equipment-input" name="tbs-input" />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="postcss">
.equipment {
  display: grid;
  grid-template-columns: repeat(2, auto);
  grid-template-rows: repeat(5, auto);
}

.component-title {
  grid-column: span 2;
}

.equipment-label {
  text-align: left;
}
</style>
