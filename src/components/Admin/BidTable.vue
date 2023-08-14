<template>
  <AdminTable :loading="loading"
              :table="table">
    <template #charts>
      <details>
        <summary>Price Distribution</summary>
        <div class="content">
          <Bar :options="priceDistributionOptions"
               :data="priceDistributionData" />
        </div>
      </details>
      <details>
        <summary>Duration Distribution</summary>
        <div class="content">
          <Bar :options="durationDistributionOptions"
               :data="durationDistributionData" />
        </div>
      </details>
    </template>
  </AdminTable>
</template>

<script setup lang="ts">
import { useVueTable, createColumnHelper, getCoreRowModel, SortingState, getSortedRowModel, Table, CellContext } from '@tanstack/vue-table';
import { Bid } from '~/types/types';
import { validate, and, isNumber, isWholeNumber, asNumber, isPositive } from '~/utils/validation';
import { Bar } from 'vue-chartjs';
import { BarControllerChartOptions, ChartData, ChartOptions, CoreChartOptions, DatasetChartOptions, ElementChartOptions, PluginChartOptions, ScaleChartOptions, plugins } from 'chart.js'
import { _DeepPartialObject } from 'chart.js/dist/types/utils';

const adminStore = useAdminStore();

const inputCell = (info: CellContext<Bid, number>) => {
  return h('input', {
    value: info.getValue(),
    onBeforeinput: (evt: InputEvent) => validate(and(isNumber(), isWholeNumber(), asNumber(isPositive())))(evt as InputEvent),
    onInput: (e: InputEvent) => adminStore.updateBid(info.row.original.id, Number((e.target as HTMLInputElement).value))
  });
}

type BarOptions = _DeepPartialObject<CoreChartOptions<"bar"> & ElementChartOptions<"bar"> & PluginChartOptions<"bar"> & DatasetChartOptions<"bar"> & ScaleChartOptions<"bar"> & BarControllerChartOptions>;
type BarData = ChartData<"bar", (number | [number, number] | null)[], unknown>;

const priceDistributionOptions: BarOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
  },
}

const priceDistributionData = computed<BarData>(() => {
  const sortedBids = adminStore.bids.sort((a, b) => a.price - b.price);
  const labels = sortedBids.map(bid => adminStore.users.find(user => user.id === bid.userID)?.username);
  const datasets = [{ data: sortedBids.map(bid => bid.price), backgroundColor: '#4285f4' }];
  return { labels, datasets };
});

const durationDistributionOptions: BarOptions = {
  responsive: true,
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
  const data: { x: number, y: number }[] = [];
  adminStore.bids.forEach(({ promisedDuration }) => {
    const group = data.find(group => group.x === promisedDuration);
    if (group) {
      group.y++;
    } else {
      data.push({ x: promisedDuration, y: 1 });
    }
  });
  const datasets = [{ data, backgroundColor: '#4285f4' }];
  return { datasets } as unknown as BarData;
});

const columnHelper = createColumnHelper<Bid>();
const columns = [
  columnHelper.accessor(row => adminStore.users.find(user => user.id === row.userID)?.username, {
    id: 'username',
    cell: info => info.getValue(),
    header: 'Username',
  }),
  columnHelper.accessor(row => row.price, {
    id: 'price',
    cell: info => info.getValue(),
    header: 'Price',
  }),
  columnHelper.accessor(row => row.promisedDuration, {
    id: 'promisedDuration',
    cell: info => info.getValue(),
    header: 'Promised Duration',
  }),
  columnHelper.accessor(row => row.expectedCost, {
    id: 'expectedCost',
    cell: info => info.getValue(),
    header: 'Expected Cost',
  }),
  columnHelper.accessor(row => row.expectedDuration, {
    id: 'expectedDuration',
    cell: info => info.getValue(),
    header: 'Expected Duration',
  }),
  columnHelper.accessor(row => row.revisedPrice, {
    id: 'revisedPrice',
    cell: info => inputCell(info),
    header: 'Revised Price',
  }),
  columnHelper.accessor(row => row.price === row.revisedPrice ? 'Yes' : 'Rejected', {
    id: 'bidAccepted',
    cell: info => info.getValue(),
    header: 'Bid Accepted?',
  }),
];

const sorting = ref<SortingState>([]);

let table: Table<Bid>;

const createTable = () => {
  table = useVueTable({
    get data() {
      return adminStore.bids;
    },
    columns,
    state: {
      get sorting() {
        return sorting.value;
      }
    },
    onSortingChange: updaterOrValue => {
      sorting.value = typeof updaterOrValue === 'function' ? updaterOrValue(sorting.value) : updaterOrValue;
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
};

const loading = ref(true);
if (adminStore.users.length > 0) {
  createTable();
  loading.value = false;
} else {
  const loadingWatcher = watch(() => adminStore.users, () => {
    if (adminStore.users.length > 0) {
      createTable();
      loading.value = false;
      loadingWatcher();
    }
  });
}
</script>

<style scoped lang="postcss"></style>