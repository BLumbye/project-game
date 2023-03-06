<template>
  <div class="equipment">
    <h3 class="component-title">Order equipment</h3>
    <span class="equipment-column-label">Equipment</span>
    <span class="equipment-column-label">Order</span>
    <label for="steelwork-input"
           class="equipment-label">Steelwork (Task A)</label>
    <input v-model="steelwork"
           class="equipment-input"
           name="steelwork-input"
           :disabled="previousEquipment.steelwork!.status !== 'unordered'" />
    <label for="interior-input"
           class="equipment-label">Interior (Task B)</label>
    <input v-model="interior"
           class="equipment-input"
           name="interior-input"
           :disabled="previousEquipment.interior!.status !== 'unordered'" />
    <label for="tbs-input"
           class="equipment-label">TBS (Task C)</label>
    <input v-model="tbs"
           class="equipment-input"
           name="tbs-input"
           :disabled="previousEquipment.tbs!.status !== 'unordered'" />
  </div>
</template>

<script setup lang="ts">
import { computed, Ref, ref, watch } from 'vue';
import { useEquipmentStore } from '../../stores/equipmentStore';
import { useWeekStore } from '../../stores/weekStore';
import { EquipmentType } from '../../types/types';

const steelwork = ref('');
const interior = ref('');
const tbs = ref('');

const weekStore = useWeekStore();
const equipmentStore = useEquipmentStore();
const previousEquipment = computed(() => equipmentStore.equipmentAtWeek(weekStore.week - 1));

const makeEquipmentWatcher = (input: Ref<string>, type: EquipmentType) => {
  return watch(input, () => {
    if (['1', '2'].includes(input.value)) {
      equipmentStore.order(type, input.value === '1' ? 'regular' : 'express');
    } else {
      equipmentStore.unorder(type);
    }
  });
};

const stopSteelworkWatcher = makeEquipmentWatcher(steelwork, 'steelwork');
const stopInteriorWatcher = makeEquipmentWatcher(interior, 'interior');
const stopTBSWatcher = makeEquipmentWatcher(tbs, 'tbs');

watch([() => equipmentStore.timeline, () => weekStore.week], () => {
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
</script>

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
