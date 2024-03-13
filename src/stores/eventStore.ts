import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import config from '~/config';

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
    // Apply bid duration modification effect if accepted
    if (value && config.events[name].effects?.some((effect) => effect.bidDurationModification)) {
      useBidStore().promisedDuration += config.events[name].effects!.reduce(
        (acc, effect) => acc + (effect.bidDurationModification || 0),
        0,
      );
    }
  }

  return {
    eventChoices,
    setEventChoice,
  };
});
