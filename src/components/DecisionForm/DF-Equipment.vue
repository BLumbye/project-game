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
    <label for="steelwork-input"
           class="equipment-label">Steelwork (Task A)</label>
    <select v-model="steelwork"
            name="steelwork-input"
            id="steelwork-input"
            class="equipment-input"
            :disabled="previousEquipment.steelwork.status !== 'unordered' || gameStore.ready">
      <option value="0">Not ordered</option>
      <option value="1">Regular delivery</option>
      <option value="2">Express delivery</option>
      <option v-if="equipmentStore.equipment.steelwork.status === 'delivered'"
              value="3">Delivered</option>
    </select>
    <label for="interior-input"
           class="equipment-label">Interior (Task B)</label>
    <select v-model="interior"
            name="interior-input"
            id="interior-input"
            class="equipment-input"
            :disabled="previousEquipment.interior.status !== 'unordered' || gameStore.ready">
      <option value="0">Not ordered</option>
      <option value="1">Regular delivery</option>
      <option value="2">Express delivery</option>
      <option v-if="equipmentStore.equipment.interior.status === 'delivered'"
              value="3">Delivered</option>
    </select>
    <label for="tbs-input"
           class="equipment-label">TBS (Task C)</label>
    <select v-model="tbs"
            name="tbs-input"
            id="tbs-input"
            class="equipment-input"
            :disabled="previousEquipment.tbs.status !== 'unordered' || gameStore.ready">
      <option value="0">Not ordered</option>
      <option value="1">Regular delivery</option>
      <option value="2">Express delivery</option>
      <option v-if="equipmentStore.equipment.tbs.status === 'delivered'"
              value="3">Delivered</option>
    </select>
  </div>
</template>

<!-- Script -->

<script setup lang="ts">
import { WatchStopHandle } from 'vue';
import { EquipmentType } from '../../types/types';

const steelwork = ref<'0' | '1' | '2' | '3'>('0');
const interior = ref<'0' | '1' | '2' | '3'>('0');
const tbs = ref<'0' | '1' | '2' | '3'>('0');

const gameStore = useGameStore();
const equipmentStore = useEquipmentStore();
const previousEquipment = computed(() => equipmentStore.equipmentAtWeek(gameStore.week - 1));

/**
 * Watches for input from the player.
 * If the player progresses a week and have inputted '1' or '2' in an Equipment field, the equipment is ordered. 
 * @param input The input in the field
 * @param type The type of equipment
 */
const makeEquipmentWatcher = (input: Ref<'0' | '1' | '2' | '3'>, type: EquipmentType) => {
  return watch(input, () => {
    console.log(input.value)
    if (input.value === '0') {
      equipmentStore.unorder(type);
    } else if (input.value === '1') {
      equipmentStore.order(type, 'regular');
    } else {
      equipmentStore.order(type, 'express');
    }
  });
};

const setInput = (input: Ref<'0' | '1' | '2' | '3'>, type: EquipmentType) => {
  if (previousEquipment.value[type].status !== 'unordered') {
    if (equipmentStore.equipment[type].status === 'ordered') {
      input.value = equipmentStore.equipment[type].deliveryType === 'regular' ? '1' : '2';
    } else {
      input.value = '3';
    }
    return true;
  }
  return false;
};

let stopSteelworkWatcher: WatchStopHandle;
let stopInteriorWatcher: WatchStopHandle;
let stopTBSWatcher: WatchStopHandle;

watch([() => equipmentStore.timeline, () => gameStore.week], () => {
  if (setInput(steelwork, 'steelwork')) {
    stopSteelworkWatcher();
  }
  if (setInput(interior, 'interior')) {
    stopInteriorWatcher();
  }
  if (setInput(tbs, 'tbs')) {
    stopTBSWatcher();
  }
}, { deep: true });

if (gameStore.synchronized) {
  watch(() => equipmentStore.loading, () => {
    setInput(steelwork, 'steelwork');
    setInput(interior, 'interior');
    setInput(tbs, 'tbs');

    stopSteelworkWatcher = makeEquipmentWatcher(steelwork, 'steelwork');
    stopInteriorWatcher = makeEquipmentWatcher(interior, 'interior');
    stopTBSWatcher = makeEquipmentWatcher(tbs, 'tbs');
  });
} else {
  stopSteelworkWatcher = makeEquipmentWatcher(steelwork, 'steelwork');
  stopInteriorWatcher = makeEquipmentWatcher(interior, 'interior');
  stopTBSWatcher = makeEquipmentWatcher(tbs, 'tbs');
}
</script>

<!-- Styling -->

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
