/**
 * exportToExcel.js — shared Excel export utility
 *
 * Converts one or more data arrays into sheets in a single .xlsx file
 * and triggers a browser download. No backend call needed — uses data
 * already loaded in the page.
 *
 * Usage:
 *   exportToExcel('customers', [{ sheetName: 'Customers', rows: sorted }])
 *   exportToExcel('orders', [
 *     { sheetName: 'Monthly Revenue', rows: orders },
 *     { sheetName: 'Revenue by City', rows: cities },
 *   ])
 */

import * as XLSX from 'xlsx';

export function exportToExcel(filename, sheets) {
  const workbook = XLSX.utils.book_new();

  sheets.forEach(({ sheetName, rows }) => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
