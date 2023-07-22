import { defineStore } from 'pinia';

export const useGameStore = defineStore('game', () => {
  //Uses setup store
  // State
  const week = ref(0);
  const plannedprojectGame = ref(false); //When a planned game for the course to take together is to take place

  // Getters
  const decisionForm = computed(() => week.value + 1);

  // Actions

  /**
   * Progresses the week when the player is done with the decision form
   */
  function nextWeek() {
    week.value++;
  }

  return { week, decisionForm, nextWeek, plannedprojectGame };
});
