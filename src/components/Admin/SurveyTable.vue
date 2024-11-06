<template>
  <AdminTable :loading="loading" :table="table">
    <template #charts>
      <details>
        <summary>Confidence</summary>
        <div class="content">
          <ConfidenceChart />
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
} from '@tanstack/vue-table';
import { AdminData } from '~/hooks/adminData';
import { SurveyAnswer } from '~/types/types';

const currentGameData = inject<Ref<AdminData>>('currentGameData')!;

const columnHelper = createColumnHelper<SurveyAnswer>();
const columns = [
  columnHelper.accessor((row) => currentGameData.value.users.find((user) => user.id === row.userID)?.username, {
    id: 'username',
    cell: (info) => info.getValue(),
    header: 'Username',
  }),
  columnHelper.accessor((row) => row.projectType, {
    id: 'project-type',
    cell: (info) => info.getValue(),
    header: 'Project Type',
    minSize: 200,
  }),
  columnHelper.accessor((row) => row.caseIndustry, {
    id: 'case-industry',
    cell: (info) => info.getValue(),
    header: 'Case Industry',
    minSize: 250,
  }),
  columnHelper.accessor((row) => row.location, {
    id: 'location',
    cell: (info) => info.getValue(),
    header: 'Location',
  }),
  columnHelper.accessor((row) => row.profitConfidence, {
    id: 'profit-confidence',
    cell: (info) => info.getValue(),
    header: 'Profit Confidence',
  }),
  columnHelper.accessor((row) => row.timeConfidence, {
    id: 'time-confidence',
    cell: (info) => info.getValue(),
    header: 'Time Confidence',
  }),
  columnHelper.accessor((row) => row.topPerformerConfidence, {
    id: 'top-performer-confidence',
    cell: (info) => info.getValue(),
    header: 'Top Performer Confidence',
  }),
  columnHelper.accessor((row) => row.projectAbility, {
    id: 'project-ability',
    cell: (info) => info.getValue(),
    header: 'Project Ability',
  }),
  columnHelper.accessor((row) => row.projectKnowledge, {
    id: 'project-knowledge',
    cell: (info) => info.getValue(),
    header: 'Project Knowledge',
  }),
  columnHelper.accessor((row) => row.superiorKnowledge, {
    id: 'superior-knowledge',
    cell: (info) => info.getValue(),
    header: 'Superior Knowledge',
  }),
];

const sorting = ref<SortingState>([]);

let table: Table<SurveyAnswer>;

const createTable = () => {
  table = useVueTable({
    get data() {
      return currentGameData.value.surveyAnswers;
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
