<template>
  <AdminTable :loading="loading"
              :table="table" />
</template>

<script setup lang="ts">
import { useVueTable, createColumnHelper, getCoreRowModel, SortingState, getSortedRowModel, Table, CellContext } from '@tanstack/vue-table';
import { AdminGameState } from '~/types/types';

const adminStore = useAdminStore();

const columnHelper = createColumnHelper<AdminGameState>();
const columns = [
  columnHelper.accessor(row => adminStore.users.find(user => user.id === row.userID)?.username, {
    id: 'username',
    cell: info => info.getValue(),
    header: 'Username',
  }),
  columnHelper.accessor(row => row.status, {
    id: 'status',
    cell: info => info.getValue(),
    header: 'Status',
  }),
  columnHelper.accessor(row => `${(row.progress * 100).toFixed(0)}%`, {
    id: 'progress',
    cell: info => info.getValue(),
    header: 'Progress',
  }),
  columnHelper.accessor(row => row.week, {
    id: 'week',
    cell: info => info.getValue(),
    header: 'Week',
  }),
  columnHelper.accessor(row => row.ready ? 'Yes' : 'No', {
    id: 'ready',
    cell: info => info.getValue(),
    header: 'Ready',
  }),
];

const sorting = ref<SortingState>([]);

let table: Table<AdminGameState>;

const createTable = () => {
  table = useVueTable({
    get data() {
      return adminStore.gameStates;
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