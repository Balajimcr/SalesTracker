import { Employee } from "@/components/dashboard/EmployeeManagement";

const SALARY_STORAGE_KEY = 'employee_salary_data';
const ADVANCE_STORAGE_KEY = 'employee_salary_advances';

export interface SalaryAdvance {
  id: string;
  date: string;
  amount: number;
  employeeId: string;
  comments: string;
  type: 'bank' | 'cash';
}

export interface EmployeeSalary {
  id: string;
  month: string;
  employeeId: string;
  salary: number;
  totalSales: number;
  monthlyBankTransfers: number;
  monthlyCashWithdrawn: number;
  totalSalaryAdvance: number;
  balanceCurrent: number;
  balanceTillDate: number;
}

// CSV-based salary and advance management with file download/upload
export class CSVSalaryService {
  private salaryData: { [storeId: string]: EmployeeSalary[] } = {};
  private advanceData: { [storeId: string]: SalaryAdvance[] } = {};

  constructor() {
    this.loadFromLocalStorage();
  }

  // Load data from localStorage
  private loadFromLocalStorage(): void {
    const salaryJSON = localStorage.getItem(SALARY_STORAGE_KEY);
    const advanceJSON = localStorage.getItem(ADVANCE_STORAGE_KEY);
    
    this.salaryData = salaryJSON ? JSON.parse(salaryJSON) : {};
    this.advanceData = advanceJSON ? JSON.parse(advanceJSON) : {};
  }

  // Save data to localStorage and export CSV
  private saveToLocalStorage(): void {
    localStorage.setItem(SALARY_STORAGE_KEY, JSON.stringify(this.salaryData));
    localStorage.setItem(ADVANCE_STORAGE_KEY, JSON.stringify(this.advanceData));
  }

  // Get salary data for a store
  getSalaryDataForStore(storeId: string): EmployeeSalary[] {
    return this.salaryData[storeId] || [];
  }

  // Save salary data for a store
  saveSalaryDataForStore(storeId: string, salaries: EmployeeSalary[]): void {
    this.salaryData[storeId] = salaries;
    this.saveToLocalStorage();
    this.exportSalaryDataToCSV(storeId);
  }

  // Get advances for a store
  getAdvancesForStore(storeId: string): SalaryAdvance[] {
    return this.advanceData[storeId] || [];
  }

  // Save advance for a store
  saveAdvanceForStore(storeId: string, advance: SalaryAdvance): void {
    if (!this.advanceData[storeId]) {
      this.advanceData[storeId] = [];
    }
    
    const existingIndex = this.advanceData[storeId].findIndex(a => a.id === advance.id);
    if (existingIndex >= 0) {
      this.advanceData[storeId][existingIndex] = advance;
    } else {
      this.advanceData[storeId].push(advance);
    }
    
    this.saveToLocalStorage();
    this.exportAdvancesToCSV(storeId);
  }

  // Delete advance for a store
  deleteAdvanceFromStore(storeId: string, advanceId: string): void {
    if (this.advanceData[storeId]) {
      this.advanceData[storeId] = this.advanceData[storeId].filter(a => a.id !== advanceId);
      this.saveToLocalStorage();
      this.exportAdvancesToCSV(storeId);
    }
  }

  // Export salary data to CSV
  private exportSalaryDataToCSV(storeId: string): void {
    const salaries = this.getSalaryDataForStore(storeId);
    if (salaries.length === 0) return;

    const headers = [
      'id', 'month', 'employeeId', 'salary', 'totalSales', 
      'monthlyBankTransfers', 'monthlyCashWithdrawn', 'totalSalaryAdvance', 
      'balanceCurrent', 'balanceTillDate'
    ];
    
    const rows = salaries.map(salary => [
      salary.id,
      salary.month,
      salary.employeeId,
      salary.salary,
      salary.totalSales,
      salary.monthlyBankTransfers,
      salary.monthlyCashWithdrawn,
      salary.totalSalaryAdvance,
      salary.balanceCurrent,
      salary.balanceTillDate
    ].join(','));
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    this.downloadCSV(csvContent, `${storeId}_salary_data.csv`);
  }

  // Export advances to CSV
  private exportAdvancesToCSV(storeId: string): void {
    const advances = this.getAdvancesForStore(storeId);
    if (advances.length === 0) return;

    const headers = ['id', 'date', 'amount', 'employeeId', 'comments', 'type'];
    const rows = advances.map(advance => [
      advance.id,
      advance.date,
      advance.amount,
      advance.employeeId,
      `"${advance.comments}"`,
      advance.type
    ].join(','));
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    this.downloadCSV(csvContent, `${storeId}_salary_advances.csv`);
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

  // Import salary data from CSV
  importSalaryDataFromCSV(storeId: string, file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const csvData = event.target?.result as string;
          const lines = csvData.split('\n');
          const dataRows = lines.slice(1);
          
          const importedSalaries: EmployeeSalary[] = dataRows
            .filter(row => row.trim() !== '')
            .map(row => {
              const [id, month, employeeId, salary, totalSales, monthlyBankTransfers, 
                     monthlyCashWithdrawn, totalSalaryAdvance, balanceCurrent, balanceTillDate] = row.split(',');
              return {
                id: id.trim(),
                month: month.trim(),
                employeeId: employeeId.trim(),
                salary: parseFloat(salary) || 0,
                totalSales: parseFloat(totalSales) || 0,
                monthlyBankTransfers: parseFloat(monthlyBankTransfers) || 0,
                monthlyCashWithdrawn: parseFloat(monthlyCashWithdrawn) || 0,
                totalSalaryAdvance: parseFloat(totalSalaryAdvance) || 0,
                balanceCurrent: parseFloat(balanceCurrent) || 0,
                balanceTillDate: parseFloat(balanceTillDate) || 0
              };
            });
          
          this.salaryData[storeId] = importedSalaries;
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

  // Import advances from CSV
  importAdvancesFromCSV(storeId: string, file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const csvData = event.target?.result as string;
          const lines = csvData.split('\n');
          const dataRows = lines.slice(1);
          
          const importedAdvances: SalaryAdvance[] = dataRows
            .filter(row => row.trim() !== '')
            .map(row => {
              const [id, date, amount, employeeId, comments, type] = row.split(',');
              return {
                id: id.trim(),
                date: date.trim(),
                amount: parseFloat(amount) || 0,
                employeeId: employeeId.trim(),
                comments: comments.replace(/"/g, '').trim(),
                type: (type.trim() as 'bank' | 'cash') || 'bank'
              };
            });
          
          this.advanceData[storeId] = importedAdvances;
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
}

// Export singleton instance
export const csvSalaryService = new CSVSalaryService();