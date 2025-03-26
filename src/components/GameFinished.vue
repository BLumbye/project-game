<!-- 
  GameFinished

  The GameFinished is for when the game is over (either won or lost).
  It is shown next to the weekly report and informs the player of how well it went. 


-->

<template>
  <div class="contents boxed">
    <h2>{{ gameStore.gameWon ? 'Project Completed' : 'Project not completed in time' }}</h2>
    <p v-if="gameStore.gameWon" class="text-won">
      You've successfully completed the project in {{ gameStore.week }}
      {{ gameStore.config.durationIdentifier.plural }} with
      {{
        financeStore.balanceAtWeek(gameStore.week + 1) >= 0
          ? `${formattedBalance} in profit.`
          : `${formattedBalance} over budget.`
      }}
    </p>

    <img v-if="gameStore.gameWon" class="won-image" :src="'/images/CELEBRATING.png'" :title="'Congratulations!'" />
    <template v-else>
      <p>The project was not completed because you failed to {{ loseReasons }} in time.</p>
      <WRAllocation v-if="!activitiesStore.allActivitiesDone() && gameStore.week > 1" :week="gameStore.week + 2" />
      <WRWorkers v-if="workersLeft && gameStore.week > 1" :week="gameStore.week + 2" />
      <WRFinances v-if="financeStore.loan !== 0 && gameStore.week > 1" :week="gameStore.week + 2" />
    </template>

    <!-- Finance Chart -->
    <div class="chart-container">
      <canvas ref="chartRef"></canvas>
    </div>

    <!-- Activity Progress Chart -->
    <div class="chart-container">
      <canvas ref="progressChartRef"></canvas>
    </div>

  </div>
</template>

<!-- Script -->

<script setup lang="ts">
import { currencyFormat } from '~/utils/formatters';
import Chart from 'chart.js/auto';

const chartRef = ref<HTMLCanvasElement | null>(null);
const progressChartRef = ref<HTMLCanvasElement | null>(null);
const chartInstance = ref<Chart | null>(null);
const progressChartInstance = ref<Chart | null>(null);

const gameStore = useGameStore();
const financeStore = useFinanceStore();
const activitiesStore = useActivitiesStore();
const workersStore = useWorkersStore();

const listFormat = new Intl.ListFormat('en', {
  style: 'long',
  type: 'conjunction',
});

const workersLeft = computed(() => Object.values(workersStore.currentWorkers).some((worker) => worker !== 0));

const loseReasons = computed(() => {
  const reasons = [];
  if (!activitiesStore.allActivitiesDone()) reasons.push('complete all activities');
  if (workersLeft.value) reasons.push('fire all workers');
  if (financeStore.loan !== 0) reasons.push('repay your loan');
  return listFormat.format(reasons);
});

const formattedBalance = computed(() =>
  currencyFormat(gameStore.config).format(Math.abs(financeStore.balanceAtWeek(gameStore.week + 1))),
);

// Function to get weekly balance data
const getWeeklyBalances = () => {
  const weeks = Array.from({ length: gameStore.week + 1 }, (_, i) => i);
  return weeks.map((week) => financeStore.balanceAtWeek(week).toFixed(0));
};

const getWeeklyOutgoing = () => {
  const weeks = Array.from({ length: gameStore.week + 1 }, (_, i) => i);
  return weeks.map((week) => -(financeStore.outgoingTimeline.get(week - 1) || 0));
};

const getWeeklyIncoming = () => {
  const weeks = Array.from({ length: gameStore.week + 1 }, (_, i) => i);
  return weeks.map((week) => financeStore.incomingTimeline.get(week - 1) || 0);
};

const createFinanceChart = () => {
  if (!chartRef.value) return;

  // Destroy previous chart if exists. Not pretty, but works
  if (chartInstance.value) {
    chartInstance.value.destroy();
  }

  chartInstance.value = new Chart(chartRef.value, {
    type: 'line',
    data: {
      labels: Array.from({ length: gameStore.week + 1 }, (_, i) => `${i}`),
      datasets: [
        // Balance data
        {
          label: 'Balance',
          data: getWeeklyBalances(),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: true,
          tension: 0.1,
        },
        // Incoming data
        /*
        {
          label: 'Incoming',
          data: getWeeklyIncoming(),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.1,
        },
        */
        // Outgoing data
        /*
        {
          label: 'Outgoing',
          data: getWeeklyOutgoing(),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: true,
          tension: 0.1,
        },
        */
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Balance',
          },
        },
        x: {
          title: {
            display: true,
            text: `${gameStore.config.durationIdentifier.plural.toUpperCase()}`,
          },
        },
      },
    },
  });
};

const getActivityProgressOverTime = () => {
  const activities = activitiesStore.activities; // Assuming activitiesStore.activities is an array of activities
  const weeks = Array.from({ length: gameStore.week + 1 }, (_, i) => i);

  return activities.map(activity => ({
    label: activity.label,
    progressData: weeks.map(week => {
      const progress = activitiesStore.activitiesAtWeek(week).find(a => a.label === activity.label)?.progress;
      return progress === null ? 0 : progress / activitiesStore.activitiesAtWeek(week).find(a => a.label === activity.label)?.duration * 100;
    })
  }));
};

const createActivityProgressChart = () => {
  if (!progressChartRef.value) return;

  if (progressChartInstance.value) {
    progressChartInstance.value.destroy();
  }

  const progressData = getActivityProgressOverTime();
  const colors = ['#FF5733', '#36A2EB', '#FFCE56', '#4CAF50', '#9C27B0', '#795548', '#FF9800', '#607D8B', '#E91E63', '#3F51B5', '#009688', '#FF5722'];

  progressChartInstance.value = new Chart(progressChartRef.value, {
    type: 'line',
    data: {
      labels: Array.from({ length: gameStore.week + 1 }, (_, i) => `${i}`),
      datasets: progressData.map((activity, index) => ({
        label: activity.label,
        data: activity.progressData,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '40',
        pointRadius: 4,
        borderWidth: 2,
        tension: 0.2,
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true },
        tooltip: { displayColors: false },
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          title: { display: true, text: 'Progress (%)' }
        },
        x: { title: { display: true, text: `${gameStore.config.durationIdentifier.plural.toUpperCase()}` } }
      }
    }
  });
};

onMounted(() => { //TODO: Check if this is necessary
  createFinanceChart();
  createActivityProgressChart();
});
watch(() => gameStore.week, () => { //TODO: Only update once
  createFinanceChart();
  createActivityProgressChart();
});

watch(
  () => gameStore.gameOver,
  () => {
    if (gameStore.gameOver) {
      open();
    }
  },
);

defineExpose({
  open,
});
</script>

<!-- Styling -->

<style scoped lang="postcss">
.contents {
  display: flex;
  flex-direction: column;
  gap: 1em;
  max-height: 100%;
  align-items: center;
  max-width: 40%;
}

.chart-container {
  width: 100%;
  height: 320px;
  background: #fff;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.text-won {
  font-size: 20px;
  font-weight: bold;
}

.won-image {
  max-width: 50%;
  border-radius: 0.5em;
}
</style>
