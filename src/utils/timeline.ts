import { ref, computed, Ref } from 'vue';
import { useWeekStore } from '../stores/weekStore';

const sumReducer = (accumulator: number, currentValue: number) => accumulator + currentValue;

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
      return timeline.value.slice(0, index + 1).reduce(reducer, initialValue);
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

function createWeeklyTimeline<T>(defaultValue: T, reducer: (accumulator: T, currentValue: T) => T, initialValue: T) {
  const weekStore = useWeekStore();
  const timeline = createTimeline(defaultValue, reducer, initialValue);

  const get = computed(() => {
    return (week?: number) => {
      week ??= weekStore.week;
      return timeline.get.value(week);
    };
  });

  const getReduced = computed(() => {
    return (week?: number) => {
      week ??= weekStore.week;
      return timeline.getReduced.value(week);
    };
  });

  function set(value: T, week?: number) {
    week ??= weekStore.week;
    timeline.set(value, week);
  }

  /**
   * Only works for number timelines
   * @param value
   * @param week
   */
  function add(value: number, week?: number) {
    week ??= weekStore.week;
    timeline.set((((timeline.get.value(week) || defaultValue) as number) + value) as T, week);
  }

  return { ...timeline, get, getReduced, set, add };
}

export { createTimeline, createWeeklyTimeline, sumReducer };
