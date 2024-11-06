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
import { GameSummary, Bid } from '~/types/types';
import { currencyFormat } from '~/utils/formatters';
import { AdminData } from '~/hooks/adminData';
import { Games } from '~/pocketbase';

const currentGame = inject<Ref<Games>>('currentGame')!;
const currentGameData = inject<Ref<AdminData>>('currentGameData')!;

interface AdditionalData {
  eventChoices: Record<string, string>;
  durationModification: number;
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
  columnHelper.accessor((row) => (row.price === row.revisedPrice ? 'Yes' : 'Rejected'), {
    id: 'bidAccepted',
    cell: (info) => info.getValue(),
    header: 'Bid Accepted?',
  }),
  columnHelper.accessor((row) => row.revisedPrice, {
    id: 'revisedPrice',
    cell: (info) => currencyFormat(currentGame!.value.config).format(info.getValue()),
    header: 'Revised Price',
  }),
  columnHelper.accessor((row) => (row.status === 'playing' ? 'Disconnected' : (row.status ?? 'Not started')), {
    id: 'status',
    cell: (info) => info.getValue(),
    header: 'Status',
  }),
  ...Object.entries(currentGame.value.config.events)
    .filter(([, event]) => event.choices !== undefined)
    .map(([eventName]) =>
      columnHelper.accessor((row) => row.eventChoices![eventName] || 'Undecided', {
        id: `event-${eventName}`,
        cell: (info) => info.getValue(),
        header: `Event: ${eventName}`,
      }),
    ),
  columnHelper.accessor(
    (row) => (row.status === 'won' ? currencyFormat(currentGame!.value.config).format(row.totalBalance!) : ''),
    {
      id: 'finalProfit',
      cell: (info) => info.getValue(),
      header: 'Final Profit',
      sortDescFirst: false,
      sortingFn: (a, b) =>
        a.getValue('status') !== 'won'
          ? 1
          : b.getValue('status') !== 'won'
            ? -1
            : a.original.totalBalance! - b.original.totalBalance!,
    },
  ),
  columnHelper.accessor((row) => (row.status === 'won' ? row.week : ''), {
    id: 'actualDuration',
    cell: (info) => info.getValue(),
    header: 'Actual Duration',
    sortDescFirst: false,
    sortingFn: (a, b) =>
      a.getValue('status') !== 'won' ? 1 : b.getValue('status') !== 'won' ? -1 : a.original.week! - b.original.week!,
  }),
  columnHelper.accessor((row) => (row.status === 'won' ? row.durationModification : ''), {
    id: 'durationModification',
    cell: (info) => info.getValue(),
    header: 'Duration Modification',
    sortDescFirst: false,
    sortingFn: (a, b) =>
      a.getValue('status') !== 'won'
        ? 1
        : b.getValue('status') !== 'won'
          ? -1
          : a.original.durationModification! - b.original.durationModification!,
  }),
  columnHelper.accessor((row) => (row.status === 'won' ? row.planDurationDiff : ''), {
    id: 'durationDiff',
    cell: (info) => info.getValue(),
    header: 'Plan - Actual Duration',
    sortDescFirst: false,
    sortingFn: (a, b) =>
      a.getValue('status') !== 'won'
        ? 1
        : b.getValue('status') !== 'won'
          ? -1
          : a.original.planDurationDiff! - b.original.planDurationDiff!,
  }),
  columnHelper.accessor(
    (row) => (row.status === 'won' ? currencyFormat(currentGame!.value.config).format(row.actualCost!) : ''),
    {
      id: 'actualCost',
      cell: (info) => info.getValue(),
      header: 'Actual Cost',
      sortDescFirst: false,
      sortingFn: (a, b) =>
        a.getValue('status') !== 'won'
          ? 1
          : b.getValue('status') !== 'won'
            ? -1
            : a.original.actualCost! - b.original.actualCost!,
    },
  ),
  columnHelper.accessor(
    (row) => (row.status === 'won' ? currencyFormat(currentGame!.value.config).format(row.planCostDiff!) : ''),
    {
      id: 'planCostDiff',
      cell: (info) => info.getValue(),
      header: 'Plan vs actual costs',
      sortDescFirst: false,
      sortingFn: (a, b) =>
        a.getValue('status') !== 'won'
          ? 1
          : b.getValue('status') !== 'won'
            ? -1
            : a.original.planCostDiff! - b.original.planCostDiff!,
    },
  ),
  columnHelper.accessor((row) => (row.status === 'won' ? row.priceRank : ''), {
    id: 'priceRank',
    cell: (info) => info.getValue(),
    header: 'Lowest price',
    sortDescFirst: false,
    sortingFn: (a, b) =>
      a.getValue('status') !== 'won'
        ? 1
        : b.getValue('status') !== 'won'
          ? -1
          : a.original.priceRank! - b.original.priceRank!,
  }),
  columnHelper.accessor((row) => (row.status === 'won' ? row.costRank : ''), {
    id: 'costRank',
    cell: (info) => info.getValue(),
    header: 'Lowest cost',
    sortDescFirst: false,
    sortingFn: (a, b) =>
      a.getValue('status') !== 'won'
        ? 1
        : b.getValue('status') !== 'won'
          ? -1
          : a.original.costRank! - b.original.costRank!,
  }),
  columnHelper.accessor((row) => (row.status === 'won' ? row.profitRank : ''), {
    id: 'profitRank',
    cell: (info) => info.getValue(),
    header: 'Highest profit',
    sortDescFirst: false,
    sortingFn: (a, b) =>
      a.getValue('status') !== 'won'
        ? 1
        : b.getValue('status') !== 'won'
          ? -1
          : a.original.profitRank! - b.original.profitRank!,
  }),
  columnHelper.accessor((row) => (row.status === 'won' ? row.planRank : ''), {
    id: 'planRank',
    cell: (info) => info.getValue(),
    header: 'Plan ability (costs)',
    sortDescFirst: false,
    sortingFn: (a, b) =>
      a.getValue('status') !== 'won'
        ? 1
        : b.getValue('status') !== 'won'
          ? -1
          : a.original.planRank! - b.original.planRank!,
  }),
  columnHelper.accessor((row) => (row.status === 'won' ? row.durationRank : ''), {
    id: 'durationRank',
    cell: (info) => info.getValue(),
    header: 'Quickest delivery',
    sortDescFirst: false,
    sortingFn: (a, b) =>
      a.getValue('status') !== 'won'
        ? 1
        : b.getValue('status') !== 'won'
          ? -1
          : a.original.durationRank! - b.original.durationRank!,
  }),
  columnHelper.accessor((row) => (row.status === 'won' ? row.projectManagerScore : ''), {
    id: 'projectManager',
    cell: (info) => info.getValue(),
    header: 'Project manager',
    sortDescFirst: false,
    sortingFn: (a, b) =>
      a.getValue('status') !== 'won'
        ? 1
        : b.getValue('status') !== 'won'
          ? -1
          : a.original.projectManagerScore! - b.original.projectManagerScore!,
  }),
  columnHelper.accessor((row) => (canWinStakeholder(row) ? row.stakeholderScore : ''), {
    id: 'stakeholder',
    cell: (info) => info.getValue(),
    header: 'Stakeholder',
    sortDescFirst: false,
    sortingFn: (a, b) =>
      canWinStakeholder(b.original)
        ? 1
        : canWinStakeholder(a.original)
          ? -1
          : a.original.stakeholderScore! - b.original.stakeholderScore!,
  }),
  columnHelper.accessor((row) => (row.status === 'won' ? row.contractorScore : ''), {
    id: 'contractor',
    cell: (info) => info.getValue(),
    header: 'Contractor',
    sortDescFirst: false,
    sortingFn: (a, b) =>
      a.getValue('status') !== 'won'
        ? 1
        : b.getValue('status') !== 'won'
          ? -1
          : a.original.contractorScore! - b.original.contractorScore!,
  }),
];

const canWinStakeholder = (data: TableData) =>
  data.status === 'won' &&
  !Object.entries(data.eventChoices!).some(([eventName, choice]) =>
    currentGame.value.config.events[eventName].choices?.[choice].effects?.some(
      (effect) => effect.excludeStakeholderWin,
    ),
  );
const getDurationModification = (eventChoices: Record<string, string>) =>
  Object.entries(eventChoices).reduce((acc, [eventName, choice]) => {
    return (
      acc +
      (currentGame.value.config.events[eventName].choices?.[choice].effects?.reduce(
        (acc, effect) => acc + (effect.resultsDurationModification || 0),
        0,
      ) || 0)
    );
  }, 0);

const sorting = ref<SortingState>([]);

let table: Table<TableData>;
const data = ref<TableData[]>([]);

const createTable = () => {
  table = useVueTable({
    get data() {
      return data.value;
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

watch(
  () => [currentGameData.value.bids, currentGameData.value.gameSummaries, currentGameData.value.eventChoices],
  () => {
    if (currentGameData.value.bids.length > 0 && currentGameData.value.gameSummaries.length > 0) {
      const bidSummaryMerge = currentGameData.value.bids.map((bid) => ({
        ...bid,
        ...currentGameData.value.gameSummaries.find((summary) => summary.userID === bid.userID),
        eventChoices: currentGameData.value.eventChoices[bid.userID] || {},
      }));
      data.value = bidSummaryMerge.map((row) => {
        if (!row.status || row.totalBalance === undefined || row.week === undefined) {
          return row;
        }
        const durationModification = getDurationModification(row.eventChoices!);
        const planDurationDiff = row.week - row.promisedDuration;
        const actualCost = row.revisedPrice - row.totalBalance;
        const planCostDiff = Math.abs(row.totalBalance + row.expectedCost - row.revisedPrice);
        const priceRank =
          bidSummaryMerge.filter((r) => r.status === 'won' && r.revisedPrice < row.revisedPrice).length + 1;
        const costRank =
          bidSummaryMerge.filter((r) => r.status === 'won' && r.revisedPrice - r.totalBalance! < actualCost).length + 1;
        const profitRank =
          bidSummaryMerge.filter((r) => r.status === 'won' && r.totalBalance! > row.totalBalance!).length + 1;
        const planRank =
          bidSummaryMerge.filter(
            (r) => r.status === 'won' && Math.abs(r.totalBalance! + r.expectedCost - r.revisedPrice) < planCostDiff,
          ).length + 1;
        const durationRank =
          bidSummaryMerge.filter(
            (r) =>
              r.status === 'won' &&
              r.week! + getDurationModification(r.eventChoices!) < row.week! + durationModification,
          ).length + 1;
        const projectManagerScore = priceRank + costRank + profitRank + planRank + durationRank;
        const stakeholderScore = priceRank + durationRank;
        const contractorScore = profitRank + durationRank;
        return {
          ...row,
          durationModification,
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
        };
      });
    }
  },
  { immediate: true },
);

const loading = ref(true);
if (
  currentGameData.value.users.length > 0 &&
  currentGameData.value.bids.length > 0 &&
  currentGameData.value.gameSummaries.length > 0
) {
  createTable();
  loading.value = false;
} else {
  const loadingWatcher = watch(
    () => [currentGameData.value.users, currentGameData.value.bids, currentGameData.value.gameSummaries],
    () => {
      if (
        currentGameData.value.users.length > 0 &&
        currentGameData.value.bids.length > 0 &&
        currentGameData.value.gameSummaries.length > 0
      ) {
        createTable();
        loading.value = false;
        loadingWatcher();
      }
    },
  );
}
</script>

<style scoped lang="postcss"></style>
