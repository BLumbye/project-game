import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, Colors } from 'chart.js';

export function initializeChartjs() {
  ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, Colors);

  ChartJS.defaults.borderColor = '#888';
  ChartJS.defaults.color = '#fff';
}
