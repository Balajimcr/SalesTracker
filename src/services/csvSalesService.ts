import { SalesRecord } from "@/types/salesTypes";
import { calculateDerivedValues } from "@/utils/salesCalculations";

export class CSVSalesService {
  private salesByStore: Map<string, SalesRecord[]> = new Map();

  constructor() {
    this.loadFromLocalStorage();
  }

  // Load sales from localStorage (fallback)
  private loadFromLocalStorage(): void {
    // Try to load store-specific sales first
    const storeSalesJSON = localStorage.getItem('store_sales_records');
    if (storeSalesJSON) {
      const storeSales = JSON.parse(storeSalesJSON);
      Object.keys(storeSales).forEach(storeId => {
        this.salesByStore.set(storeId, storeSales[storeId]);
      });
      return;
    }

    // Fallback to global sales for backward compatibility
    const salesJSON = localStorage.getItem('sales_records');
    if (salesJSON) {
      const sales = JSON.parse(salesJSON);
      const defaultStoreId = 'default-store';
      this.salesByStore.set(defaultStoreId, sales);
    }
  }

  // Get sales records for specific store
  getSalesRecordsForStore(storeId: string): SalesRecord[] {
    return this.salesByStore.get(storeId) || [];
  }

  // Save sales record for specific store
  saveSalesRecordForStore(storeId: string, record: SalesRecord): void {
    const processedRecord = calculateDerivedValues({
      ...record,
      storeId: storeId
    });
    
    const salesRecords = this.getSalesRecordsForStore(storeId);
    salesRecords.push(processedRecord);
    
    this.salesByStore.set(storeId, salesRecords);
    this.saveToLocalStorage();
    this.exportSalesToCSV(storeId);
  }

  // Save all sales to localStorage
  private saveToLocalStorage(): void {
    const storeSales: { [key: string]: SalesRecord[] } = {};
    this.salesByStore.forEach((sales, storeId) => {
      storeSales[storeId] = sales;
    });
    localStorage.setItem('store_sales_records', JSON.stringify(storeSales));
  }

  // Export sales to CSV for specific store
  private exportSalesToCSV(storeId: string): void {
    const records = this.getSalesRecordsForStore(storeId);
    const csvContent = this.recordsToCSV(records);
    this.downloadCSV(csvContent, `${storeId}/sales_records.csv`);
  }

  // Convert records to CSV format
  private recordsToCSV(records: SalesRecord[]): string {
    if (!records.length) return '';
    
    const processedRecords = records.map(record => calculateDerivedValues(record));
    
    const headers = [
      'Date', 'Store ID', 'Opening Cash', 'Total POS Sales', 'Paytm Sales', 
      'Employee1 Advance', 'Employee2 Advance', 'Employee3 Advance', 'Employee4 Advance',
      'Cleaning Expenses', 'Other Expense 1 Name', 'Other Expense 1 Amount',
      'Other Expense 2 Name', 'Other Expense 2 Amount', 'Rs.500 Count', 'Rs.200 Count',
      'Rs.100 Count', 'Rs.50 Count', 'Rs.20 Count', 'Rs.10 Count', 'Rs.5 Count',
      'Cash Withdrawn', 'Total Expenses', 'Total from Denominations', 'Closing Cash',
      'Total Cash Sales', 'Total Cash', 'Cash Difference'
    ].join(',');
    
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
        `"${record.otherExpenses.name1}"`,
        record.otherExpenses.amount1,
        `"${record.otherExpenses.name2}"`,
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
  }

  // Download CSV helper
  private downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Import sales from CSV for specific store
  importSalesFromCSV(storeId: string, file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const csvData = event.target?.result as string;
          const lines = csvData.split('\n');
          const dataRows = lines.slice(1);
          
          const importedSales: SalesRecord[] = dataRows
            .filter(row => row.trim() !== '')
            .map(row => {
              const values = row.split(',');
              return {
                date: values[0],
                storeId: storeId,
                openingCash: parseFloat(values[2]) || 0,
                totalSalesPOS: parseFloat(values[3]) || 0,
                paytmSales: parseFloat(values[4]) || 0,
                employeeAdvances: {
                  employee1: parseFloat(values[5]) || 0,
                  employee2: parseFloat(values[6]) || 0,
                  employee3: parseFloat(values[7]) || 0,
                  employee4: parseFloat(values[8]) || 0
                },
                cleaningExpenses: parseFloat(values[9]) || 0,
                otherExpenses: {
                  name1: values[10]?.replace(/"/g, '') || '',
                  amount1: parseFloat(values[11]) || 0,
                  name2: values[12]?.replace(/"/g, '') || '',
                  amount2: parseFloat(values[13]) || 0
                },
                denominations: {
                  d500: parseInt(values[14]) || 0,
                  d200: parseInt(values[15]) || 0,
                  d100: parseInt(values[16]) || 0,
                  d50: parseInt(values[17]) || 0,
                  d20: parseInt(values[18]) || 0,
                  d10: parseInt(values[19]) || 0,
                  d5: parseInt(values[20]) || 0
                },
                cashWithdrawn: parseFloat(values[21]) || 0
              };
            });
          
          // Replace existing sales for this store
          this.salesByStore.set(storeId, importedSales);
          this.saveToLocalStorage();
          
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  }

  // Export all store sales
  exportAllStoreSales(): void {
    this.salesByStore.forEach((sales, storeId) => {
      this.exportSalesToCSV(storeId);
    });
  }
}

// Export singleton instance
export const csvSalesService = new CSVSalesService();