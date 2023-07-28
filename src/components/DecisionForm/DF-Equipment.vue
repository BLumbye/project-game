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
           class="equipment-label">Fridges (Task D)</label>
    <input v-model="steelwork"
           class="equipment-input"
           name="steelwork-input"
           @beforeinput="(evt) => validate(and(isNumber(), isWholeNumber(), asNumber(isPositive())))(evt as InputEvent)"
           :disabled="previousEquipment.steelwork!.status !== 'unordered' || gameStore.ready" />
    <label for="interior-input"
           class="equipment-label">Drinks (Task E)</label>
  </div>
</template>

<!-- Script -->

<script setup lang="ts">
import { WatchStopHandle } from 'vue';
import { EquipmentType } from '../../types/types';
import { and, asNumber, isNumber, isPositive, isWholeNumber, validate } from '~/utils/validation';

const steelwork = ref('');
const interior = ref('');
const tbs = ref('');

const gameStore = useGameStore();
const equipmentStore = useEquipmentStore();
const previousEquipment = computed(() => equipmentStore.equipmentAtWeek(gameStore.week - 1));

/**
 * Watches for input from the player.
 * If the player progresses a week and have inputted '1' or '2' in an Equipment field, the equipment is ordered. 
 * @param input The input in the field
 * @param type The type of equipment
 */
const makeEquipmentWatcher = (input: Ref<string>, type: EquipmentType) => {
  return watch(input, () => {
    if (['1', '2'].includes(input.value)) {
      equipmentStore.order(type, input.value === '1' ? 'regular' : 'express');
    } else {
      equipmentStore.unorder(type);
    }
  });
};

let stopSteelworkWatcher: WatchStopHandle;
let stopInteriorWatcher: WatchStopHandle;
let stopTBSWatcher: WatchStopHandle;

watch([() => equipmentStore.timeline, () => gameStore.week], () => {
  if (previousEquipment.value.steelwork!.status !== 'unordered') {
    stopSteelworkWatcher();
    steelwork.value = equipmentStore.equipment.steelwork!.status!;
  }
  if (previousEquipment.value.interior!.status !== 'unordered') {
    stopInteriorWatcher();
    interior.value = equipmentStore.equipment.interior!.status!;
  }
  if (previousEquipment.value.tbs!.status !== 'unordered') {
    stopTBSWatcher();
    tbs.value = equipmentStore.equipment.tbs!.status!;
  }
}, { deep: true });

if (gameStore.synchronized) {
  watch(() => equipmentStore.loading, () => {
    if (previousEquipment.value.steelwork!.status !== 'unordered') {
      steelwork.value = equipmentStore.equipment.steelwork!.status!;
    } else if (equipmentStore.equipment.steelwork!.status === 'ordered') {
      steelwork.value = equipmentStore.equipment.steelwork!.deliveryType === 'regular' ? '1' : '2';
    }
    if (previousEquipment.value.interior!.status !== 'unordered') {
      interior.value = equipmentStore.equipment.interior!.status!;
    } else if (equipmentStore.equipment.interior!.status === 'ordered') {
      interior.value = equipmentStore.equipment.interior!.deliveryType === 'regular' ? '1' : '2';
    }
    if (previousEquipment.value.tbs!.status !== 'unordered') {
      tbs.value = equipmentStore.equipment.tbs!.status!;
    } else if (equipmentStore.equipment.tbs!.status === 'ordered') {
      tbs.value = equipmentStore.equipment.tbs!.deliveryType === 'regular' ? '1' : '2';
    }

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
