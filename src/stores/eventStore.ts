import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import config from '../config';

type EventChoices = Record<string, boolean>;

export const useEventStore = defineStore('event', () => {
  // Event choices
  const eventChoices = useStorage('eventChoices', {} as EventChoices);

  function setEventChoice(name: string, value: boolean) {
    eventChoices.value[name] = value;
    if (value && config.events[name].effects?.some((effect) => effect.immediateReward)) {
      // Add the immediate reward to the finances
      useFinanceStore().recieveReward(config.events[name].effects?.find((effect) => effect.immediateReward)?.immediateReward as number, useGameStore().week);
    }
  }

  return {
    eventChoices,
    setEventChoice,
  };
});
