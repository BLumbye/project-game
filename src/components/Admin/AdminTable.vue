<template>
  <p v-if="loading">Loading...</p>
  <div class="admin-table-container"
       v-else>
    <div class="table-export-buttons">
      <button @click="exportCSV(table, 'bids')">Export to CSV</button>
      <button @click="exportXLSX(table, 'bids')">Export to XLSX</button>
    </div>
    <div class="admin-table-scroll-container">
      <table class="admin-table">
        <thead>
          <tr v-for="headerGroup in table.getHeaderGroups()"
              :key="headerGroup.id">
            <th v-for="header in headerGroup.headers"
                :key="header.id"
                :colSpan="header.colSpan"
                :class="header.column.getCanSort() ? 'th-sortable' : ''"
                :style="{ minWidth: `${header.column.getSize()}px` }"
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
                :key="cell.id"
                :style="{ minWidth: `${cell.column.getSize()}px` }">
              <FlexRender :render="cell.column.columnDef.cell"
                          :props="cell.getContext()" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Table, FlexRender } from '@tanstack/vue-table';
import { exportCSV, exportXLSX } from '~/utils/exportTable';

defineProps<{
  loading: boolean;
  table: Table<any>;
}>();
</script>