<!-- 
  DecisionForm

  The DecisionForm is where player(s) make all their decisions for the coming week.
  Choices include: 
    Ordering equipment
    Hiring workers
    Allocating workers
    Taking/repaying a loan


-->

<template>
  <div class="decision-form">
    <h2 class="boxed section-title">Decision form for week {{ gameStore.decisionForm }}</h2>
    <DFWorkers class="workers boxed" />
    <DFEquipment class="equipment boxed" />
    <DFAllocation class="allocation boxed" />
    <DFLoan v-if="config.loansEnabled"
            class="loan boxed" />
    <DFBid class="bid boxed" />
    <DFDoneButton class="done-button" />
  </div>
</template>

<!-- Script -->

<script setup lang="ts">
import config from '~/config';

const gameStore = useGameStore();
</script>

<!-- Styling -->

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
  max-height: 100%;

  .section-title {
    grid-column: span 2;
  }
}

.allocation,
.done-button {
  grid-column: span 2;
}
</style>