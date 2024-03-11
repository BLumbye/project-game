<template>
  <div class="options">
    <label>
      <input type="checkbox"
             v-model="hideLegend" />
      Hide legend
    </label>
    <label>
      <input type="checkbox"
             v-model="hideMeans" />
      Hide means
    </label>
  </div>
  <Line :options="confidenceOptions"
        :data="confidenceData" />
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs';
import { ChartData, CoreChartOptions, DatasetChartOptions, ElementChartOptions, PluginChartOptions, ScaleChartOptions, Point } from 'chart.js'
import { AnnotationOptions } from 'chartjs-plugin-annotation'
import { _DeepPartialObject } from 'chart.js/dist/types/utils';
import { LineControllerChartOptions } from 'chart.js';
import { VNodeRef } from 'vue';

const adminStore = useAdminStore();

const hideLegend = ref(false);
const hideMeans = ref(false);
const binSize = 5;
const colors = ['#4285f4', '#db4437', '#f4b400']

type LineOptions = _DeepPartialObject<CoreChartOptions<"line"> & ElementChartOptions<"line"> & PluginChartOptions<"line"> & DatasetChartOptions<"line"> & ScaleChartOptions<"line"> & LineControllerChartOptions & AnnotationOptions>;
type LineData = ChartData<"line", (number | Point | null)[], unknown>;

// @ts-expect-error
const confidenceOptions = computed<LineOptions>(() => ({
  responsive: true,
  devicePixelRatio: 4,
  plugins: {
    legend: {
      display: !hideLegend.value,
    },
    annotation: {
      annotations: {
        profitMean: hideMeans.value ? undefined : {
          type: 'line',
          xMin: getMeanLine('profitConfidence'),
          xMax: getMeanLine('profitConfidence'),
          borderColor: colors[0],
          borderWidth: 4,
        },
        timeMean: hideMeans.value ? undefined : {
          type: 'line',
          xMin: getMeanLine('timeConfidence'),
          xMax: getMeanLine('timeConfidence'),
          borderColor: colors[1],
          borderWidth: 4,
        },
        topPerformerMean: hideMeans.value ? undefined : {
          type: 'line',
          xMin: getMeanLine('topPerformerConfidence'),
          xMax: getMeanLine('topPerformerConfidence'),
          borderColor: colors[2],
          borderWidth: 4,
        }
      }
    }
  },
  scales: {
    x: {
      min: 50,
      max: 100,
      ticks: {
        callback: (value: number) => `${value * binSize + 50}%`,
      }
    }
  }
}));

// @ts-expect-error
const confidenceData = computed<LineData>(() => {
  const labels = Array.from({ length: (100 - 50) / binSize + 1 }, (_, i) => i * binSize + 50);
  const profitConfidences = adminStore.surveyAnswers.map(({ profitConfidence }) => profitConfidence);
  const timeConfidences = adminStore.surveyAnswers.map(({ timeConfidence }) => timeConfidence);
  const topPerformerConfidences = adminStore.surveyAnswers.map(({ topPerformerConfidence }) => topPerformerConfidence);
  const sharedStyles = { fill: false, tension: 0.4, pointStyle: false };
  const datasets = [{ data: createHistogramData(binSize, profitConfidences), borderColor: colors[0], label: 'Confidence: Expected profit margin?', ...sharedStyles },
  { data: createHistogramData(binSize, timeConfidences), borderColor: colors[1], label: 'Confidence: Project on time?', ...sharedStyles },
  { data: createHistogramData(binSize, topPerformerConfidences), borderColor: colors[2], label: 'Confidence: Top 10 performers in the class?', ...sharedStyles }];
  return { labels, datasets };
});

function createHistogramData(binSize: number, data: number[]) {
  const min = 50;
  const max = 100;
  const bins = Array<number>((max - min) / binSize + 1).fill(0);
  data.forEach(value => {
    const binIndex = Math.floor((value - min) / binSize);
    bins[binIndex]++;
  });
  return bins;
}

function getMeanLine(key: 'profitConfidence' | 'timeConfidence' | 'topPerformerConfidence') {
  return (adminStore.surveyAnswers.map(({ [key]: confidence }) => confidence).reduce((a, b) => a + b, 0) / adminStore.surveyAnswers.length - 50) / binSize;
}
</script>

<style scoped lang="postcss">
.options {
  display: flex;
  margin-bottom: 1rem;
  gap: 1.5rem;
}
</style>