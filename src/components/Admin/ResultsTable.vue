<template>
  <AdminTable :loading="loading"
              :table="table" />
</template>

<script setup lang="ts">
import { useVueTable, createColumnHelper, getCoreRowModel, SortingState, getSortedRowModel, Table, CellContext } from '@tanstack/vue-table';
import { GameSummary, Bid } from '~/types/types';

const adminStore = useAdminStore();

interface AdditionalData {
  planDurationDiff: number;
  actualCost: number;
  planCostDiff: number;
  priceRank: number;
  costRank: number;
  profitRank: number;
  planRank: number;
  durationRank: number;
  projectManagerScore: number;
  stakeholderScore: number;
  contractorScore: number;
}
type TableData = Bid & Partial<GameSummary> & Partial<AdditionalData>;
const columnHelper = createColumnHelper<TableData>();
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
  columnHelper.accessor(row => row.price === row.revisedPrice ? 'Yes' : 'Rejected', {
    id: 'bidAccepted',
    cell: info => info.getValue(),
    header: 'Bid Accepted?',
  }),
  columnHelper.accessor(row => row.revisedPrice, {
    id: 'revisedPrice',
    cell: info => info.getValue(),
    header: 'Revised Price',
  }),
  columnHelper.accessor(row => row.status === 'playing' ? 'Disconnected' : row.status ?? 'Not started', {
    id: 'status',
    cell: info => info.getValue(),
    header: 'Status',
  }),
  columnHelper.accessor(row => row.status === 'won' ? row.totalBalance : '', {
    id: 'finalProfit',
    cell: info => info.getValue(),
    header: 'Final Profit',
  }),
  columnHelper.accessor(row => row.status === 'won' ? row.week : '', {
    id: 'actualDuration',
    cell: info => info.getValue(),
    header: 'Actual Duration',
  }),
  columnHelper.accessor(row => row.status === 'won' ? row.planDurationDiff : '', {
    id: 'durationDiff',
    cell: info => info.getValue(),
    header: 'Plan - Actual Duration',
  }),
  columnHelper.accessor(row => row.status === 'won' ? row.actualCost : '', {
    id: 'actualCost',
    cell: info => info.getValue(),
    header: 'Actual Cost',
  }),
  columnHelper.accessor(row => row.status === 'won' ? row.planCostDiff : '', {
    id: 'planCostDiff',
    cell: info => info.getValue(),
    header: 'Plan vs actual costs',
  }),
  columnHelper.accessor((row) => row.status === 'won' ? row.priceRank : '', {
    id: 'priceRank',
    cell: info => info.getValue(),
    header: 'Lowest price',
  }),
  columnHelper.accessor((row) => row.status === 'won' ? row.costRank : '', {
    id: 'costRank',
    cell: info => info.getValue(),
    header: 'Lowest cost',
  }),
  columnHelper.accessor((row) => row.status === 'won' ? row.profitRank : '', {
    id: 'profitRank',
    cell: info => info.getValue(),
    header: 'Highest profit',
  }),
  columnHelper.accessor((row) => row.status === 'won' ? row.planRank : '', {
    id: 'planRank',
    cell: info => info.getValue(),
    header: 'Plan ability (costs)',
  }),
  columnHelper.accessor((row) => row.status === 'won' ? row.durationRank : '', {
    id: 'durationRank',
    cell: info => info.getValue(),
    header: 'Quickest delivery',
  }),
  columnHelper.accessor((row) => row.status === 'won' ? row.projectManagerScore : '', {
    id: 'projectManager',
    cell: info => info.getValue(),
    header: 'Project manager',
  }),
  columnHelper.accessor((row) => row.status === 'won' ? row.stakeholderScore : '', {
    id: 'stakeholder',
    cell: info => info.getValue(),
    header: 'Stakeholder',
  }),
  columnHelper.accessor((row) => row.status === 'won' ? row.contractorScore : '', {
    id: 'contractor',
    cell: info => info.getValue(),
    header: 'Contractor',
  }),
];

const sorting = ref<SortingState>([]);

let table: Table<TableData>;

const createTable = () => {
  table = useVueTable({
    get data() {
      const bidSummaryMerge = adminStore.bids.map(bid => ({
        ...bid,
        ...adminStore.gameSummaries.find(summary => summary.userID === bid.userID),
      }));
      return bidSummaryMerge.map(row => {
        if (!row.status || row.totalBalance === undefined || row.week === undefined) {
          return row;
        }
        const planDurationDiff = row.week - row.promisedDuration;
        const actualCost = row.revisedPrice - row.totalBalance;
        const planCostDiff = Math.abs(row.totalBalance + row.expectedCost - row.price);
        const priceRank = adminStore.bids.filter(bid => bid.price < row.price).length + 1;
        const costRank = bidSummaryMerge.filter(r => r.status === 'won' && r.revisedPrice - r.totalBalance! < actualCost).length + 1;
        const profitRank = bidSummaryMerge.filter(r => r.status === 'won' && r.totalBalance! > row.totalBalance!).length + 1;
        const planRank = bidSummaryMerge.filter(r => r.status === 'won' && Math.abs(r.totalBalance! + r.expectedCost - r.price) < planCostDiff).length + 1;
        const durationRank = bidSummaryMerge.filter(r => r.status === 'won' && r.week! < row.week!).length + 1;
        const projectManagerScore = priceRank + costRank + profitRank + planRank + durationRank;
        const stakeholderScore = priceRank + durationRank;
        const contractorScore = profitRank + durationRank;
        return {
          ...row,
          planDurationDiff,
          actualCost,
          planCostDiff,
          priceRank,
          costRank,
          profitRank,
          planRank,
          durationRank,
          projectManagerScore,
          stakeholderScore,
          contractorScore,
        }
      });
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