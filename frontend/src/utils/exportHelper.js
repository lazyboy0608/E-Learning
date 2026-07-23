import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Xuất dữ liệu JSON ra file Excel (.xlsx)
 * @param {Array} data Danh sách đối tượng JSON
 * @param {string} fileName Tên file xuất ra (không kèm đuôi)
 * @param {string} sheetName Tên của sheet trong file Excel
 */
export const exportToExcel = (data, fileName = 'export', sheetName = 'Scores') => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });
    saveAs(dataBlob, `${fileName}.xlsx`);
  } catch (error) {
    console.error('Failed to export to Excel:', error);
    alert('Có lỗi xảy ra khi xuất file Excel.');
  }
};

/**
 * Hỗ trợ in vùng nội dung ra PDF
 */
export const printPDF = () => {
  window.print();
};
