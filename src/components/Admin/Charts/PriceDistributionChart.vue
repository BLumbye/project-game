<template>
  <div class="options">
    <label>
      <input type="checkbox"
             v-model="hideUsernames" />
      Hide usernames
    </label>
    <label>
      <input type="checkbox"
             v-model="hideCutoffs" />
      Hide cutoffs
    </label>
    <label>
      <input type="checkbox"
             v-model="hideOutliers" />
      Hide outliers
    </label>
  </div>
  <Bar :options="priceDistributionOptions"
       :data="priceDistributionData" />
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs';
import { BarControllerChartOptions, ChartData, ChartOptions, CoreChartOptions, DatasetChartOptions, ElementChartOptions, PluginChartOptions, ScaleChartOptions, plugins } from 'chart.js'
import { AnnotationOptions } from 'chartjs-plugin-annotation'
import { _DeepPartialObject } from 'chart.js/dist/types/utils';
import config from '~/config';

const adminStore = useAdminStore();

const hideUsernames = ref(false);
const hideCutoffs = ref(false);
const hideOutliers = ref(false);

type BarOptions = _DeepPartialObject<CoreChartOptions<"bar"> & ElementChartOptions<"bar"> & PluginChartOptions<"bar"> & DatasetChartOptions<"bar"> & ScaleChartOptions<"bar"> & BarControllerChartOptions & AnnotationOptions>;
type BarData = ChartData<"bar", (number | [number, number] | null)[], unknown>;

const priceDistributionOptions = computed<BarOptions>(() => ({
  responsive: true,
  devicePixelRatio: 4,
  plugins: {
    legend: {
      display: false,
    },
    annotation: {
      annotations: {
        minCutoff: hideCutoffs.value ? undefined : {
          type: 'line',
          yMin: config.bid.min,
          yMax: config.bid.min,
          borderColor: '#ff0000',
          borderWidth: 2,
        },
        maxCutoff: hideCutoffs.value ? undefined : {
          type: 'line',
          yMin: config.bid.max,
          yMax: config.bid.max,
          borderColor: '#ff0000',
          borderWidth: 2,
        }
      },
    }
  },
  scales: {
    x: {
      ticks: {
        display: !hideUsernames.value,
      }
    },
    y: {
      beginAtZero: true,
      suggestedMax: !hideCutoffs.value ? config.bid.max * 1.05 : undefined,
    }
  }
}));

const priceDistributionData = computed<BarData>(() => {
  let sortedBids = adminStore.bids.sort((a, b) => a.price - b.price);
  if (hideOutliers.value) {
    sortedBids = removeOutliers(sortedBids);
  }
  const labels = sortedBids.map(bid => adminStore.users.find(user => user.id === bid.userID)?.username);
  const datasets = [{ data: sortedBids.map(bid => bid.price), backgroundColor: '#4285f4' }];
  return { labels, datasets };
});

function removeOutliers(sortedBids: typeof adminStore.bids) {
  const q1 = sortedBids[Math.floor((sortedBids.length / 4))];
  const q3 = sortedBids[Math.floor((sortedBids.length / 4) * 3)];
  const iqr = q3.price - q1.price;
  return adminStore.bids.filter(bid => bid.price >= q1.price - iqr * 1.5 && bid.price <= q3.price + iqr * 1.5);
}
</script>

<style scoped lang="postcss">
.options {
  display: flex;
  margin-bottom: 1rem;
  gap: 1.5rem;
}
</style>