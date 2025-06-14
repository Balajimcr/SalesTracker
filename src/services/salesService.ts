
import { SalesRecord } from "@/types/salesTypes";
import { calculateDerivedValues } from "@/utils/salesCalculations";
import { getActiveStoreId } from "./storeService";

const STORAGE_KEY = 'sales_records';

// Convert records to CSV format
export const recordsToCSV = (records: SalesRecord[]): string => {
  if (!records.length) return '';
  
  // Process all records to ensure derived values are calculated
  const processedRecords = records.map(record => calculateDerivedValues(record));
  
  // Create headers from first record
  const headers = [
    'Date', 'Store ID', 'Opening Cash', 'Total POS Sales', 'Paytm Sales', 
    'Employee1 Advance', 'Employee2 Advance', 'Employee3 Advance', 'Employee4 Advance',
    'Cleaning Expenses', 'Other Expense 1 Name', 'Other Expense 1 Amount',
    'Other Expense 2 Name', 'Other Expense 2 Amount', 'Rs.500 Count', 'Rs.200 Count',
    'Rs.100 Count', 'Rs.50 Count', 'Rs.20 Count', 'Rs.10 Count', 'Rs.5 Count',
    'Cash Withdrawn', 'Total Expenses', 'Total from Denominations', 'Closing Cash',
    'Total Cash Sales', 'Total Cash', 'Cash Difference'
  ].join(',');
  
  // Create rows
  const rows = processedRecords.map(record => {
    return [
      record.date,
      record.storeId || '',
      record.openingCash,
      record.totalSalesPOS,
      record.paytmSales,
      record.employeeAdvances.employee1,
      record.employeeAdvances.employee2,
      record.employeeAdvances.employee3,
      record.employeeAdvances.employee4,
      record.cleaningExpenses,
      record.otherExpenses.name1,
      record.otherExpenses.amount1,
      record.otherExpenses.name2,
      record.otherExpenses.amount2,
      record.denominations.d500,
      record.denominations.d200,
      record.denominations.d100,
      record.denominations.d50,
      record.denominations.d20,
      record.denominations.d10,
      record.denominations.d5,
      record.cashWithdrawn,
      record.totalExpenses,
      record.totalFromDenominations,
      record.closingCash,
      record.totalCashSales,
      record.totalCash,
      record.cashDifference
    ].join(',');
  });
  
  return [headers, ...rows].join('\n');
};

// Save sales record
export const saveSalesRecord = (record: SalesRecord): void => {
  // Process record to calculate derived values and add store ID
  const processedRecord = calculateDerivedValues({
    ...record,
    storeId: record.storeId || getActiveStoreId() || undefined
  });
  
  // Get existing records
  const existingRecordsJSON = localStorage.getItem(STORAGE_KEY);
  const existingRecords: SalesRecord[] = existingRecordsJSON ? JSON.parse(existingRecordsJSON) : [];
  
  // Add new record
  const updatedRecords = [...existingRecords, processedRecord];
  
  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
};

// Get all sales records
export const getAllSalesRecords = (): SalesRecord[] => {
  const recordsJSON = localStorage.getItem(STORAGE_KEY);
  return recordsJSON ? JSON.parse(recordsJSON) : [];
};

// Get sales records for active store
export const getSalesRecordsForActiveStore = (): SalesRecord[] => {
  const activeStoreId = getActiveStoreId();
  if (!activeStoreId) return [];
  
  const allRecords = getAllSalesRecords();
  return allRecords.filter(record => record.storeId === activeStoreId);
};

// Get sales records for specific store
export const getSalesRecordsForStore = (storeId: string): SalesRecord[] => {
  const allRecords = getAllSalesRecords();
  return allRecords.filter(record => record.storeId === storeId);
};

// Download records as CSV
export const downloadRecordsAsCSV = (): void => {
  const records = getSalesRecordsForActiveStore();
  const csv = recordsToCSV(records);
  
  // Create download link
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `sales_records_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Clear all data (for testing purposes)
export const clearAllRecords = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
