<template>
  <AdminTable :loading="loading" :table="table">
    <template #charts>
      <details>
        <summary>Price Distribution</summary>
        <div class="content">
          <PriceDistributionChart />
        </div>
      </details>
      <details>
        <summary>Duration Distribution</summary>
        <div class="content">
          <DurationDistributionChart />
        </div>
      </details>
    </template>
  </AdminTable>
</template>

<script setup lang="ts">
import {
  useVueTable,
  createColumnHelper,
  getCoreRowModel,
  SortingState,
  getSortedRowModel,
  Table,
  CellContext,
} from '@tanstack/vue-table';
import { Bid } from '~/types/types';
import { validate, and, isNumber, isWholeNumber, asNumber, isPositive } from '~/utils/validation';
import { currencyFormat } from '~/utils/formatters';
import { AdminData } from '~/hooks/adminData';
import { Games } from '~/pocketbase';

const adminStore = useAdminStore();

const isGameInProgress = inject<Ref<boolean>>('isGameInProgress')!;
const currentGame = inject<Ref<Games>>('currentGame');
const currentGameData = inject<Ref<AdminData>>('currentGameData')!;

const inputCell = (info: CellContext<Bid, number>) => {
  return isGameInProgress
    ? h('input', {
        value: info.getValue(),
        onBeforeinput: (evt: InputEvent) =>
          validate(and(isNumber(), isWholeNumber(), asNumber(isPositive())))(evt as InputEvent),
        onInput: (e: InputEvent) =>
          adminStore.updateBid(info.row.original.id, Number((e.target as HTMLInputElement).value)),
      })
    : info.getValue();
};

const columnHelper = createColumnHelper<Bid>();
const columns = [
  columnHelper.accessor((row) => currentGameData.value.users.find((user) => user.id === row.userID)?.username, {
    id: 'username',
    cell: (info) => info.getValue(),
    header: 'Username',
  }),
  columnHelper.accessor((row) => row.price, {
    id: 'price',
    cell: (info) => currencyFormat(currentGame!.value.config).format(info.getValue()),
    header: 'Price',
  }),
  columnHelper.accessor((row) => row.promisedDuration, {
    id: 'promisedDuration',
    cell: (info) => info.getValue(),
    header: 'Promised Duration',
  }),
  columnHelper.accessor((row) => row.expectedCost, {
    id: 'expectedCost',
    cell: (info) => currencyFormat(currentGame!.value.config).format(info.getValue()),
    header: 'Expected Cost',
  }),
  columnHelper.accessor((row) => row.expectedDuration, {
    id: 'expectedDuration',
    cell: (info) => info.getValue(),
    header: 'Expected Duration',
  }),
  columnHelper.accessor((row) => row.revisedPrice, {
    id: 'revisedPrice',
    cell: (info) => inputCell(info),
    header: 'Revised Price',
  }),
  columnHelper.accessor((row) => (row.price === row.revisedPrice ? 'Yes' : 'Rejected'), {
    id: 'bidAccepted',
    cell: (info) => info.getValue(),
    header: 'Bid Accepted?',
  }),
];

const sorting = ref<SortingState>([]);

let table: Table<Bid>;

const createTable = () => {
  table = useVueTable({
    get data() {
      return currentGameData.value.bids;
    },
    columns,
    state: {
      get sorting() {
        return sorting.value;
      },
    },
    onSortingChange: (updaterOrValue) => {
      sorting.value = typeof updaterOrValue === 'function' ? updaterOrValue(sorting.value) : updaterOrValue;
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
};

const loading = ref(true);
if (currentGameData.value.users.length > 0) {
  createTable();
  loading.value = false;
} else {
  const loadingWatcher = watch(
    () => currentGameData.value.users,
    () => {
      if (currentGameData.value.users.length > 0) {
        createTable();
        loading.value = false;
        loadingWatcher();
      }
    },
  );
}
</script>

<style scoped lang="postcss"></style>
