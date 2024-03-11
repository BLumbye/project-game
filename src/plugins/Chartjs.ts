import { usePreferredDark } from '@vueuse/core';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  Colors,
  PointElement,
  LineElement,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

export function initializeChartjs() {
  ChartJS.register(
    Title,
    Tooltip,
    Legend,
    BarElement,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Colors,
    annotationPlugin,
  );

  ChartJS.defaults.borderColor = '#888';
  ChartJS.defaults.color = usePreferredDark().value ? '#fff' : '#000';
}
