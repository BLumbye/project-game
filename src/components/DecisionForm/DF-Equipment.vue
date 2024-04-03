<!-- 
  Equipment (Decision Form)

  Equipment is where a player orders equipment needed for activities.
  Equipment, when ordered, functions like an activity with no need for workers.
  The duration of ordered equipment is determined by input from player. 
    1 = normal delivery
    2 = express delivery (1 day less)

  Equipment cannot be ordered more than once.
-->

<template>
  <div class="equipment">
    <h3 class="component-title">Order equipment</h3>
    <span class="equipment-column-label">Equipment</span>
    <span class="equipment-column-label">Order</span>
    <template v-for="([type, configEquipment], index) in Object.entries(config.equipment)" :key="type">
      <label :for="`${type}-input`" class="equipment-label">{{ configEquipment.label }}</label>
      <select
        :id="`${type}-input`"
        v-model="values[index]"
        :name="`${type}-input`"
        class="equipment-input"
        :disabled="previousEquipment[type].status !== 'unordered' || gameStore.ready"
        @input="(evt) => onInput((evt.target! as HTMLSelectElement).value, type)"
      >
        <option value="0">Not ordered</option>
        <option value="1">Regular delivery</option>
        <option v-if="configEquipment.hasExpressDelivery !== false" value="2">Express delivery</option>
        <option v-if="equipmentStore.equipment[type].status === 'delivered'" value="3">Delivered</option>
      </select>
    </template>
  </div>
</template>

<!-- Script -->

<script setup lang="ts">
import config from '~/config';

const values = ref<('0' | '1' | '2' | '3')[]>(Object.values(config.equipment).map(() => '0'));

const gameStore = useGameStore();
const equipmentStore = useEquipmentStore();
const previousEquipment = computed(() => equipmentStore.equipmentAtWeek(gameStore.week - 1));

/**
 * Watches for input from the player.
 * If the player progresses a week and have inputted '1' or '2' in an Equipment field, the equipment is ordered.
 * @param input The input in the field
 * @param type The type of equipment
 */
const onInput = (input: string, type: string) => {
  if (input === '0') {
    equipmentStore.setDeliveryStatus(type, 'unordered');
  } else if (input === '1') {
    equipmentStore.setDeliveryStatus(type, 'ordered', 'regular');
  } else {
    equipmentStore.setDeliveryStatus(type, 'ordered', 'express');
  }
  values.value[Object.keys(config.equipment).indexOf(type)] = input as '0' | '1' | '2' | '3';
};

const setInput = (type: string) => {
  const index = Object.keys(config.equipment).indexOf(type);
  if (previousEquipment.value[type].status !== 'unordered') {
    if (equipmentStore.equipment[type].status === 'ordered') {
      values.value[index] = equipmentStore.equipment[type].deliveryType === 'regular' ? '1' : '2';
    } else {
      values.value[index] = '3';
    }
    return true;
  } else {
    values.value[index] =
      equipmentStore.equipment[type].status === 'unordered'
        ? '0'
        : equipmentStore.equipment[type].deliveryType === 'regular'
          ? '1'
          : '2';
  }
  return false;
};

watch(
  [() => equipmentStore.timeline, () => gameStore.week],
  () => {
    for (const type in config.equipment) {
      setInput(type);
    }
  },
  { deep: true },
);

watch(
  () => equipmentStore.loading,
  () => {
    for (const type in config.equipment) {
      setInput(type);
    }
  },
  { immediate: true },
);
</script>

<!-- Styling -->

<style scoped lang="postcss">
.equipment {
  display: grid;
  grid-template-columns: repeat(2, auto);
  grid-template-rows: repeat(5, auto);
  gap: 4px 0.5rem;
}

.component-title {
  grid-column: span 2;
  margin-bottom: 0.5rem;
}

.equipment-label {
  text-align: left;
}
</style>
