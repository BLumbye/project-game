<template>
  <div class="equipment">
    <h3 class="component-title">Order equipment</h3>
    <!-- header, css, fysisk title -->
    <span class="equipment-column-label">Equipment</span>
    <span class="equipment-column-label">Order</span>
    <label for="steelwork-input"
           class="equipment-label">Steelwork (Task A)</label>
    <input v-model="steelwork"
           class="equipment-input"
           name="steelwork-input"
           :disabled="equipmentStore.equipment.steelwork!.status !== 'unordered'" />
    <label for="interior-input"
           class="equipment-label">Interior (Task B)</label>
    <input v-model="interior"
           class="equipment-input"
           name="interior-input"
           :disabled="equipmentStore.equipment.interior!.status !== 'unordered'" />
    <label for="tbs-input"
           class="equipment-label">TBS (Task C)</label>
    <input v-model="tbs"
           class="equipment-input"
           name="tbs-input"
           :disabled="equipmentStore.equipment.tbs!.status !== 'unordered'" />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Ref, ref, watch } from 'vue';
import { useEquipmentStore } from '../stores/equipmentStore';
import { useWeekStore } from '../stores/weekStore';
import { EquipmentType } from '../types/types';

const steelwork = ref('');
const interior = ref('');
const tbs = ref('');

const weekStore = useWeekStore();
const equipmentStore = useEquipmentStore();

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
  if (equipmentStore.equipment.steelwork!.status !== 'unordered') {
    stopSteelworkWatcher();
    steelwork.value = equipmentStore.equipment.steelwork!.status!;
  }
  if (equipmentStore.equipment.interior!.status !== 'unordered') {
    stopInteriorWatcher();
    interior.value = equipmentStore.equipment.interior!.status!;
  }
  if (equipmentStore.equipment.tbs!.status !== 'unordered') {
    stopTBSWatcher();
    tbs.value = equipmentStore.equipment.tbs!.status!;
  }
}, { deep: true });

// weekStore.addWeekListener(() => {
//   if (steelwork.value === '1' || steelwork.value === '2') {
//     equipmentStore.order('steelwork', steelwork.value === '1' ? 'regular' : 'express');
//   }
//   if (interior.value === '1' || interior.value === '2') {
//     equipmentStore.order('interior', interior.value === '1' ? 'regular' : 'express');
//   }
//   if (tbs.value === '1' || tbs.value === '2') {
//     equipmentStore.order('tbs', tbs.value === '1' ? 'regular' : 'express');
//   }

//   steelwork.value = equipmentStore.steelwork.status === 'unordered' ? '' : equipmentStore.steelwork.status;
//   interior.value = equipmentStore.interior.status === 'unordered' ? '' : equipmentStore.interior.status;
//   tbs.value = equipmentStore.tbs.status === 'unordered' ? '' : equipmentStore.tbs.status;
// });
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
