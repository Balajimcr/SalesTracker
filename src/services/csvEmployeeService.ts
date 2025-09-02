import { Employee } from "@/components/dashboard/EmployeeManagement";

export class CSVEmployeeService {
  private employeesByStore: Map<string, Employee[]> = new Map();

  constructor() {
    this.loadFromLocalStorage();
  }

  // Load employees from localStorage (fallback)
  private loadFromLocalStorage(): void {
    // Try to load store-specific employees first
    const storeEmployeesJSON = localStorage.getItem('store_employees');
    if (storeEmployeesJSON) {
      const storeEmployees = JSON.parse(storeEmployeesJSON);
      Object.keys(storeEmployees).forEach(storeId => {
        this.employeesByStore.set(storeId, storeEmployees[storeId]);
      });
      return;
    }

    // Fallback to global employees for backward compatibility
    const employeesJSON = localStorage.getItem('employees');
    if (employeesJSON) {
      const employees = JSON.parse(employeesJSON);
      const defaultStoreId = 'default-store';
      this.employeesByStore.set(defaultStoreId, employees);
    }
  }

  // Get employees for specific store
  getEmployeesForStore(storeId: string): Employee[] {
    return this.employeesByStore.get(storeId) || [];
  }

  // Save employee for specific store
  saveEmployeeForStore(storeId: string, employee: Employee): void {
    const employees = this.getEmployeesForStore(storeId);
    const existingIndex = employees.findIndex(e => e.id === employee.id);
    
    if (existingIndex >= 0) {
      employees[existingIndex] = employee;
    } else {
      employees.push(employee);
    }
    
    this.employeesByStore.set(storeId, employees);
    this.saveToLocalStorage();
    this.exportEmployeesToCSV(storeId);
  }

  // Delete employee from specific store
  deleteEmployeeFromStore(storeId: string, employeeId: string): void {
    const employees = this.getEmployeesForStore(storeId);
    const updatedEmployees = employees.filter(e => e.id !== employeeId);
    this.employeesByStore.set(storeId, updatedEmployees);
    this.saveToLocalStorage();
    this.exportEmployeesToCSV(storeId);
  }

  // Save all employees to localStorage
  private saveToLocalStorage(): void {
    const storeEmployees: { [key: string]: Employee[] } = {};
    this.employeesByStore.forEach((employees, storeId) => {
      storeEmployees[storeId] = employees;
    });
    localStorage.setItem('store_employees', JSON.stringify(storeEmployees));
  }

  // Export employees to CSV for specific store
  private exportEmployeesToCSV(storeId: string): void {
    const employees = this.getEmployeesForStore(storeId);
    const headers = ['id', 'name', 'mobile', 'joiningDate', 'employeeNumber'];
    const rows = employees.map(employee => [
      employee.id,
      `"${employee.name}"`,
      employee.mobile,
      employee.joiningDate,
      employee.employeeNumber || 1
    ].join(','));
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    this.downloadCSV(csvContent, `${storeId}/employees.csv`);
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

  // Import employees from CSV for specific store
  importEmployeesFromCSV(storeId: string, file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const csvData = event.target?.result as string;
          const lines = csvData.split('\n');
          const dataRows = lines.slice(1);
          
          const importedEmployees: Employee[] = dataRows
            .filter(row => row.trim() !== '')
            .map(row => {
              const [id, name, mobile, joiningDate, employeeNumber] = row.split(',');
              return {
                id: id.trim(),
                name: name.replace(/"/g, '').trim(),
                mobile: mobile.trim(),
                joiningDate: joiningDate.trim(),
                employeeNumber: parseInt(employeeNumber?.trim()) || 1
              };
            });
          
          // Replace existing employees for this store
          this.employeesByStore.set(storeId, importedEmployees);
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

  // Export all store employees
  exportAllStoreEmployees(): void {
    this.employeesByStore.forEach((employees, storeId) => {
      this.exportEmployeesToCSV(storeId);
    });
  }
}

// Export singleton instance
export const csvEmployeeService = new CSVEmployeeService();