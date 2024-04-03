import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import config from '~/config';
import { collections, pocketbase, updateExistingOrCreate } from '~/pocketbase';
import { EventChoiceEffects, EventEffect } from '~/types/types';

type EventChoices = Record<string, string>;

export const useEventStore = defineStore('event', () => {
  const gameStore = useGameStore();

  // Event choices
  const eventChoices = useStorage<EventChoices>('eventChoices', {});

  function setEventChoice(name: string, choice: string) {
    eventChoices.value[name] = choice;

    // Add the immediate reward to the finances
    if (config.events[name].choices![choice].effects?.some((effect) => effect.immediateReward)) {
      useFinanceStore().recieveReward(
        config.events[name].choices![choice].effects?.find((effect) => effect.immediateReward)
          ?.immediateReward as number,
        useGameStore().week,
      );
    }

    // Update the database
    if (gameStore.synchronized) {
      updateExistingOrCreate(
        collections.eventChoices,
        `user.username="${pocketbase.authStore.model!.username}" && event="${name}"`,
        {
          user: pocketbase.authStore.model!.id,
          game_id: gameStore.gameID,
          week: gameStore.week,
          event: name,
          choice,
        },
      );
    }
  }

  const activeEventEffectsAtWeek = computed(() => (week?: number) => {
    week ??= useGameStore().week;
    return Object.entries(config.events)
      .filter(([, event]) => event.week <= week!)
      .flatMap(
        ([name, event]) =>
          [...(event.effects ?? []), ...(event.choices?.[eventChoices.value[name]]?.effects ?? [])] as (EventEffect &
            EventChoiceEffects)[],
      );
  });
  const activeEventEffects = computed(() => activeEventEffectsAtWeek.value());

  return {
    eventChoices,
    setEventChoice,
    activeEventEffectsAtWeek,
    activeEventEffects,
  };
});
