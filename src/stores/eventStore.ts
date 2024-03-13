import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';

type EventChoices = Record<string, boolean>;

export const useEventStore = defineStore('event', () => {
  // Event choices
  const eventChoices = useStorage('eventChoices', {} as EventChoices);

  function setEventChoice(name: string, value: boolean) {
    eventChoices.value[name] = value;
  }

  return {
    eventChoices,
    setEventChoice,
  };
});
