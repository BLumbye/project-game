<template>
  <div class="options">
    <label>
      <input type="checkbox"
             v-model="hideOutliers" />
      Hide outliers
    </label>
  </div>
  <Bar :options="durationDistributionOptions"
       :data="durationDistributionData" />
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs';
import { BarControllerChartOptions, ChartData, ChartOptions, CoreChartOptions, DatasetChartOptions, ElementChartOptions, PluginChartOptions, ScaleChartOptions, plugins } from 'chart.js'
import { _DeepPartialObject } from 'chart.js/dist/types/utils';

const adminStore = useAdminStore();

const hideOutliers = ref(false);

type BarOptions = _DeepPartialObject<CoreChartOptions<"bar"> & ElementChartOptions<"bar"> & PluginChartOptions<"bar"> & DatasetChartOptions<"bar"> & ScaleChartOptions<"bar"> & BarControllerChartOptions>;
type BarData = ChartData<"bar", (number | [number, number] | null)[], unknown>;

const durationDistributionOptions: BarOptions = {
  responsive: true,
  devicePixelRatio: 4,
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
      }
    },
    y: {
      type: 'linear',
      ticks: {
        precision: 0,
      }
    },
  }
}

const durationDistributionData = computed<BarData>(() => {
  let data: { x: number, y: number }[] = [];
  adminStore.bids.forEach(({ promisedDuration }) => {
    const group = data.find(group => group.x === promisedDuration);
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

function removeOutliers(data: { x: number, y: number }[]) {
  const sortedData = data.sort((a, b) => a.x - b.x);
  const q1 = sortedData[Math.floor(sortedData.length / 4)].x;
  const q3 = sortedData[Math.floor(sortedData.length * 3 / 4)].x;
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