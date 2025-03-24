<template>
  <div class="options">
    <label>
      <input v-model="hideOutliers" type="checkbox" />
      Hide outliers
    </label>
  </div>
  <Bar :options="durationDistributionOptions" :data="durationDistributionData" />
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, ChartData } from 'chart.js';
import { AdminData } from '~/hooks/adminData';

const {
  hideOutliersDefault = false,
  pixelRatio = 4,
  fontSize = 12,
} = defineProps<{
  hideOutliersDefault?: boolean;
  pixelRatio?: number;
  fontSize?: number;
}>();

const currentGameData = inject<Ref<AdminData>>('currentGameData')!;

const hideOutliers = ref(hideOutliersDefault);

type BarData = ChartData<'bar', (number | [number, number] | null)[], unknown>;

ChartJS.defaults.font.size = fontSize;

const durationDistributionOptions = {
  responsive: true,
  devicePixelRatio: pixelRatio,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      type: 'linear',
      ticks: {
        precision: 0,
      },
    },
    y: {
      type: 'linear',
      ticks: {
        precision: 0,
      },
    },
  },
} as (typeof Bar)['options'];

const durationDistributionData = computed<BarData>(() => {
  let data: { x: number; y: number }[] = [];
  currentGameData.value.bids.forEach(({ promisedDuration }) => {
    const group = data.find((group) => group.x === promisedDuration);
    if (group) {
      group.y++;
    } else {
      data.push({ x: promisedDuration, y: 1 });
    }
  });
  if (hideOutliers.value) {
    data = removeOutliers(data);
  }
  const datasets = [{ data, backgroundColor: '#4285f4' }];
  return { datasets } as unknown as BarData;
});

function removeOutliers(data: { x: number; y: number }[]) {
  const sortedData = data.sort((a, b) => a.x - b.x);
  const q1 = sortedData[Math.floor(sortedData.length / 4)].x;
  const q3 = sortedData[Math.floor((sortedData.length * 3) / 4)].x;
  const iqr = q3 - q1;
  return data.filter(({ x }) => x >= q1 - iqr * 1.5 && x <= q3 + iqr * 1.5);
}
</script>

<style scoped lang="postcss">
.options {
  display: flex;
  margin-bottom: 1rem;
  gap: 1.5rem;
}
</style>
