<template>
  <AdminTable :loading="loading" :table="table" />
</template>

<script setup lang="ts">
import {
  useVueTable,
  createColumnHelper,
  getCoreRowModel,
  SortingState,
  getSortedRowModel,
  Table,
} from '@tanstack/vue-table';
import { AdminGameState } from '~/types/types';
import { capitalize } from '~/utils/formatters';
import { AdminData } from '~/hooks/adminData';
import { Games } from '~/pocketbase';

const currentGame = inject<Ref<Games>>('currentGame')!;
const currentGameData = inject<Ref<AdminData>>('currentGameData')!;

const columnHelper = createColumnHelper<AdminGameState>();
const columns = [
  columnHelper.accessor((row) => currentGameData.value.users.find((user) => user.id === row.userID)?.username, {
    id: 'username',
    cell: (info) => info.getValue(),
    header: 'Username',
  }),
  columnHelper.accessor((row) => row.status, {
    id: 'status',
    cell: (info) => info.getValue(),
    header: 'Status',
  }),
  columnHelper.accessor((row) => `${(row.progress * 100).toFixed(0)}%`, {
    id: 'progress',
    cell: (info) => info.getValue(),
    header: 'Progress',
  }),
  columnHelper.accessor((row) => row.week, {
    id: 'week',
    cell: (info) => info.getValue(),
    header: `${capitalize(currentGame.value.config.durationIdentifier.singular)}`,
  }),
  columnHelper.accessor((row) => (row.ready ? 'Yes' : 'No'), {
    id: 'ready',
    cell: (info) => info.getValue(),
    header: 'Ready',
  }),
  ...Object.entries(currentGame.value.config.events)
    .filter(([, event]) => event.choices !== undefined)
    .map(([eventName]) =>
      columnHelper.accessor((row) => row.eventChoices[eventName] || 'Undecided', {
        id: `event-${eventName}`,
        cell: (info) => info.getValue(),
        header: `Event: ${eventName}`,
      }),
    ),
];

const sorting = ref<SortingState>([]);

let table: Table<AdminGameState>;

const createTable = () => {
  table = useVueTable({
    get data() {
      return currentGameData.value.gameStates;
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
