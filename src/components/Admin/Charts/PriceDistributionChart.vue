<template>
  <div class="options">
    <label>
      <input v-model="hideUsernames" type="checkbox" />
      Hide usernames
    </label>
    <label>
      <input v-model="hideCutoffs" type="checkbox" />
      Hide cutoffs
    </label>
    <label>
      <input v-model="hideOutliers" type="checkbox" />
      Hide outliers
    </label>
  </div>
  <Bar :options="priceDistributionOptions" :data="priceDistributionData" />
</template>

<script setup lang="ts">
import { Chart as ChartJS, ChartData } from 'chart.js';
import { Bar } from 'vue-chartjs';
import { AdminData } from '~/hooks/adminData';
import { Games } from '~/pocketbase';

const {
  hideUsernamesDefault = false,
  hideCutoffsDefault = false,
  hideOutliersDefault = false,
  pixelRatio = 4,
  fontSize = 12,
} = defineProps<{
  hideUsernamesDefault?: boolean;
  hideCutoffsDefault?: boolean;
  hideOutliersDefault?: boolean;
  pixelRatio?: number;
  fontSize?: number;
}>();

const currentGame = inject<Ref<Games>>('currentGame')!;
const currentGameData = inject<Ref<AdminData>>('currentGameData')!;

const hideUsernames = ref(hideUsernamesDefault);
const hideCutoffs = ref(hideCutoffsDefault);
const hideOutliers = ref(hideOutliersDefault);

type BarData = ChartData<'bar', (number | [number, number] | null)[], unknown>;

ChartJS.defaults.font.size = fontSize;

const priceDistributionOptions = computed<(typeof Bar)['options']>(() => ({
  responsive: true,
  devicePixelRatio: pixelRatio,
  plugins: {
    legend: {
      display: false,
    },
    annotation: {
      annotations: {
        minCutoff: hideCutoffs.value
          ? undefined
          : {
              type: 'line',
              yMin: currentGame.value.config.bid.min,
              yMax: currentGame.value.config.bid.min,
              borderColor: '#ff0000',
              borderWidth: 2,
            },
        maxCutoff: hideCutoffs.value
          ? undefined
          : {
              type: 'line',
              yMin: currentGame.value.config.bid.max,
              yMax: currentGame.value.config.bid.max,
              borderColor: '#ff0000',
              borderWidth: 2,
            },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        display: !hideUsernames.value,
      },
    },
    y: {
      beginAtZero: true,
      suggestedMax: !hideCutoffs.value ? currentGame.value.config.bid.max * 1.05 : undefined,
    },
  },
}));

const priceDistributionData = computed<BarData>(() => {
  let sortedBids = currentGameData.value.bids.sort((a, b) => a.price - b.price);
  if (hideOutliers.value) {
    sortedBids = removeOutliers(sortedBids);
  }
  const labels = sortedBids.map((bid) => currentGameData.value.users.find((user) => user.id === bid.userID)?.username);
  const datasets = [{ data: sortedBids.map((bid) => bid.price), backgroundColor: '#4285f4' }];
  return { labels, datasets };
});

function removeOutliers(sortedBids: typeof currentGameData.value.bids) {
  const q1 = sortedBids[Math.floor(sortedBids.length / 4)];
  const q3 = sortedBids[Math.floor((sortedBids.length / 4) * 3)];
  const iqr = q3.price - q1.price;
  return currentGameData.value.bids.filter(
    (bid) => bid.price >= q1.price - iqr * 1.5 && bid.price <= q3.price + iqr * 1.5,
  );
}
</script>

<style scoped lang="postcss">
.options {
  display: flex;
  margin-bottom: 1rem;
  gap: 1.5rem;
}
</style>
