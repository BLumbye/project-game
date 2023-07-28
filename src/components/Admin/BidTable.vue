<template>
  <p v-if="loading">Loading...</p>
  <table v-else>
    <thead>
      <tr v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id">
        <th v-for="header in headerGroup.headers"
            :key="header.id"
            :colSpan="header.colSpan"
            :class="header.column.getCanSort() ? 'th-sortable' : ''"
            @click="header.column.getToggleSortingHandler()?.($event)">
          <template v-if="!header.isPlaceholder">
            <FlexRender :render="header.column.columnDef.header"
                        :props="header.getContext()" />
            {{
              { asc: ' 🔼', desc: ' 🔽' }[
                header.column.getIsSorted() as string
              ]
            }}
          </template>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in table.getRowModel().rows"
          :key="row.id">
        <td v-for="cell in row.getVisibleCells()"
            :key="cell.id">
          <FlexRender :render="cell.column.columnDef.cell"
                      :props="cell.getContext()" />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { useVueTable, createColumnHelper, getCoreRowModel, FlexRender, SortingState, getSortedRowModel, Table, CellContext } from '@tanstack/vue-table';
import { Bid } from '~/types/types';
import { validate, and, isNumber, isWholeNumber, asNumber, isPositive } from '~/utils/validation';

const gameStore = useGameStore();
const adminStore = useAdminStore();

const inputCell = (info: CellContext<Bid, number>) => {
  return h('input', {
    value: info.getValue(),
    onBeforeinput: (evt: InputEvent) => validate(and(isNumber(), isWholeNumber(), asNumber(isPositive())))(evt as InputEvent),
    onInput: (e: InputEvent) => adminStore.updateBid(info.row.original.id, Number((e.target as HTMLInputElement).value), info.column.id as 'bidPrice' | 'bidDuration' | 'expectedPrice' | 'expectedDuration')
  });
}

const columnHelper = createColumnHelper<Bid>();
const columns = [
  columnHelper.accessor(row => adminStore.users.find(user => user.id === row.userID)?.username, {
    id: 'username',
    cell: info => info.getValue(),
    header: 'Username',
  }),
  columnHelper.accessor(row => row.bidPrice, {
    id: 'bidPrice',
    cell: info => gameStore.gameState === 'getting_bids' ? info.getValue() : inputCell(info),
    header: 'Bid Price',
  }),
  columnHelper.accessor(row => row.bidDuration, {
    id: 'bidDuration',
    cell: info => gameStore.gameState === 'getting_bids' ? info.getValue() : inputCell(info),
    header: 'Bid Duration',
  }),
  columnHelper.accessor(row => row.expectedPrice, {
    id: 'expectedPrice',
    cell: info => gameStore.gameState === 'getting_bids' ? info.getValue() : inputCell(info),
    header: 'Expected Price',
  }),
  columnHelper.accessor(row => row.expectedDuration, {
    id: 'expectedDuration',
    cell: info => gameStore.gameState === 'getting_bids' ? info.getValue() : inputCell(info),
    header: 'Expected Duration',
  }),
  columnHelper.accessor(row => row.ready, {
    id: 'ready',
    cell: info => info.getValue() ? 'Yes' : 'No',
    header: 'Ready',
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

<style scoped lang="postcss">
.th-sortable {
  cursor: pointer;
  user-select: none;
}

table {
  --table-border-color: #ccc;
  --odd-row-color: #333;

  border-collapse: collapse;
  border: 1px solid var(--table-border-color);

  & td,
  & th {
    padding: 0.5rem;
    text-align: left;
  }

  & thead {
    border-bottom: 1px solid var(--table-border-color);
  }

  & tbody tr:nth-child(odd) {
    background-color: var(--odd-row-color);
  }

  @media (prefers-color-scheme: light) {
    --table-border-color: #555;
    --odd-row-color: #eee;
  }
}
</style>