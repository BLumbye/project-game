import { Table } from '@tanstack/vue-table';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';

export async function exportTable(table: Table<unknown>, filename: string, filetype: 'xlsx' | 'csv') {
  const wb = new Workbook();
  const ws = wb.addWorksheet('Sheet 1');

  const lastHeaderGroup = table.getHeaderGroups().at(-1);
  if (!lastHeaderGroup) throw new Error('No header groups found');

  ws.columns = lastHeaderGroup.headers
    .filter((h) => h.column.getIsVisible())
    .map((header) => ({
      header: header.column.columnDef.header as string,
      key: header.id,
      width: 20,
    }));

  table.getCoreRowModel().rows.forEach((row) => {
    const cells = row.getVisibleCells();
    const values = cells.map((cell) => cell.getValue() ?? '');
    ws.addRow(values);
  });

  ws.getRow(1).font = { bold: true };

  const buffer = await wb[filetype].writeBuffer();
  saveAs(new Blob([buffer]), `${filename}.${filetype}`);
}

export async function exportXLSX(table: Table<unknown>, filename: string) {
  return await exportTable(table, filename, 'xlsx');
}

export async function exportCSV(table: Table<unknown>, filename: string) {
  return await exportTable(table, filename, 'csv');
}
