import { ref, computed, Ref } from 'vue';
import { useGameStore } from '../stores/gameStore';

const sumReducer = (accumulator: number, currentValue: number) => accumulator + currentValue;

/**
 * Creates a timeline with a default value, a reducer and an initial value. A timeline is an array of values that can be accessed by index and through a reduced value.
 * @param defaultValue The default value of any item in the timeline.
 * @param reducer The reducer function to use when reducing the timeline.
 * @param initialValue The initial value used when reducing the timeline.
 */
function createTimeline<T>(defaultValue: T, reducer: (accumulator: T, currentValue: T) => T, initialValue: T) {
  const timeline = ref([defaultValue]) as Ref<T[]>;

  const get = computed(() => {
    return (index?: number) => {
      index ??= timeline.value.length - 1;
      return timeline.value[index] || null;
    };
  });

  const getReduced = computed(() => {
    return (index?: number) => {
      index ??= timeline.value.length - 1;
      return timeline.value.slice(0, index + 1).reduce(reducer, structuredClone(initialValue));
    };
  });

  function populateTimeline(index: number) {
    for (let i = timeline.value.length; i <= index; i++) {
      timeline.value.push(defaultValue);
    }
  }

  function set(value: T, index: number) {
    populateTimeline(index);
    timeline.value[index] = value;
  }

  return { timeline, set, get, getReduced };
}

/**
 * Creates a weekly timeline, which is a timeline with some functions overwritten to take the current week into account.
 * @param defaultValue The default value of any item in the timeline.
 * @param reducer The reducer function to use when reducing the timeline.
 * @param initialValue The initial value used when reducing the timeline.
 * @see createTimeline for more info on timelines.
 */
function createWeeklyTimeline<T>(defaultValue: T, reducer: (accumulator: T, currentValue: T) => T, initialValue: T) {
  const gameStore = useGameStore();
  const timeline = createTimeline(defaultValue, reducer, initialValue);

  const get = computed(() => {
    return (week?: number) => {
      week ??= gameStore.week;
      return timeline.get.value(week);
    };
  });

  const getReduced = computed(() => {
    return (week?: number) => {
      week ??= gameStore.week;
      return timeline.getReduced.value(week);
    };
  });

  function set(value: T, week?: number) {
    week ??= gameStore.week;
    timeline.set(value, week);
  }

  /**
   * Only works for number timelines
   * @param value
   * @param week
   */
  function add(value: number, week?: number) {
    week ??= gameStore.week;
    timeline.set((((timeline.get.value(week) || defaultValue) as number) + value) as T, week);
  }

  return { ...timeline, get, getReduced, set, add };
}

export { createTimeline, createWeeklyTimeline, sumReducer };
