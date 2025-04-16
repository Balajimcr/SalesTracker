
// CSV Utility functions for importing and exporting data

import { toast } from "@/components/ui/sonner";
import { SalesRecord } from "@/types/salesTypes";
import { Employee } from "@/components/dashboard/EmployeeManagement";
import { calculateDerivedValues } from "./salesCalculations";

// CSV Templates
export const getEmployeeTemplate = (): string => {
  return "name,mobile,joiningDate\nJohn Doe,9876543210,2023-01-01\nJane Smith,8765432109,2023-02-15";
};

export const getSalesTemplate = (): string => {
  return "date,openingCash,totalSalesPOS,paytmSales,employeeAdvances.employee1,employeeAdvances.employee2,employeeAdvances.employee3,employeeAdvances.employee4,cleaningExpenses,otherExpenses.name1,otherExpenses.amount1,otherExpenses.name2,otherExpenses.amount2,denominations.d500,denominations.d200,denominations.d100,denominations.d50,denominations.d20,denominations.d10,denominations.d5,cashWithdrawn\n2023-04-01,5000,15000,3000,500,0,0,0,200,Maintenance,300,Supplies,150,5,10,20,15,10,5,2,1000";
};

// Helper function to download CSV content
export const downloadCSV = (csvContent: string, fileName: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export employees to CSV
export const exportEmployeesToCSV = (): void => {
  const employees = localStorage.getItem('employees');
  if (!employees || JSON.parse(employees).length === 0) {
    toast.error("No employee data to export");
    return;
  }

  const parsedEmployees: Employee[] = JSON.parse(employees);
  
  // Create headers
  const headers = ["name", "mobile", "joiningDate"];
  
  // Create rows
  const rows = parsedEmployees.map(employee => {
    return [
      employee.name,
      employee.mobile,
      employee.joiningDate
    ].join(',');
  });
  
  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadCSV(csvContent, `employees_${new Date().toISOString().split('T')[0]}.csv`);
  toast.success("Employees exported successfully");
};

// Import employees from CSV
export const importEmployeesFromCSV = (csvFile: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        const lines = csvData.split('\n');
        
        // Skip header row
        const dataRows = lines.slice(1);
        
        // Parse each row
        const employees: Employee[] = dataRows
          .filter(row => row.trim() !== '')
          .map(row => {
            const [name, mobile, joiningDate] = row.split(',');
            return {
              id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
              name: name.trim(),
              mobile: mobile.trim(),
              joiningDate: joiningDate.trim()
            };
          });
        
        // Get existing employees
        const existingEmployeesJSON = localStorage.getItem('employees');
        const existingEmployees: Employee[] = existingEmployeesJSON ? JSON.parse(existingEmployeesJSON) : [];
        
        // Merge employees (avoid duplicates by name)
        const existingNames = new Set(existingEmployees.map(e => e.name.toLowerCase()));
        const newEmployees = employees.filter(e => !existingNames.has(e.name.toLowerCase()));
        
        const updatedEmployees = [...existingEmployees, ...newEmployees];
        localStorage.setItem('employees', JSON.stringify(updatedEmployees));
        
        toast.success(`Imported ${newEmployees.length} new employees`);
        resolve();
      } catch (error) {
        console.error("Error parsing CSV:", error);
        toast.error("Failed to import employees. Please check the CSV format");
        reject(error);
      }
    };
    
    reader.onerror = () => {
      toast.error("Error reading file");
      reject(new Error("Error reading file"));
    };
    
    reader.readAsText(csvFile);
  });
};

// Export salary data to CSV
export const exportSalaryDataToCSV = (): void => {
  const salaryData = localStorage.getItem('employeeSalaryData');
  const advances = localStorage.getItem('employeeSalaryAdvances');
  const employees = localStorage.getItem('employees');
  
  if (!salaryData || !advances || !employees) {
    toast.error("No salary data to export");
    return;
  }
  
  const parsedSalary = JSON.parse(salaryData);
  const parsedAdvances = JSON.parse(advances);
  const parsedEmployees = JSON.parse(employees);
  
  if (parsedSalary.length === 0 && parsedAdvances.length === 0) {
    toast.error("No salary data to export");
    return;
  }
  
  let csvContent = "type,id,date,employeeId,employeeName,month,amount,comments,type\n";
  
  // Add salary records
  parsedSalary.forEach(salary => {
    const employee = parsedEmployees.find(e => e.id === salary.employeeId);
    csvContent += `salary,${salary.id},${salary.month}-01,${salary.employeeId},${employee?.name || 'Unknown'},${salary.month},${salary.salary},,\n`;
  });
  
  // Add advance records
  parsedAdvances.forEach(advance => {
    const employee = parsedEmployees.find(e => e.id === advance.employeeId);
    csvContent += `advance,${advance.id},${advance.date},${advance.employeeId},${employee?.name || 'Unknown'},${advance.date.substring(0, 7)},${advance.amount},${advance.comments || ''},${advance.type}\n`;
  });
  
  downloadCSV(csvContent, `salary_data_${new Date().toISOString().split('T')[0]}.csv`);
  toast.success("Salary data exported successfully");
};

// Import salary data from CSV
export const importSalaryDataFromCSV = (csvFile: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        const lines = csvData.split('\n');
        
        // Skip header row
        const dataRows = lines.slice(1);
        
        // Get existing employees to match IDs
        const existingEmployeesJSON = localStorage.getItem('employees');
        
        if (!existingEmployeesJSON) {
          toast.error("No employees found. Please import employees first");
          reject(new Error("No employees found"));
          return;
        }
        
        const existingEmployees: Employee[] = JSON.parse(existingEmployeesJSON);
        
        // Create maps for faster lookup
        const employeeIdByName = new Map();
        existingEmployees.forEach(employee => {
          employeeIdByName.set(employee.name.toLowerCase(), employee.id);
        });
        
        const salaryRecords = [];
        const advanceRecords = [];
        
        dataRows
          .filter(row => row.trim() !== '')
          .forEach(row => {
            const [type, id, date, employeeId, employeeName, month, amount, comments, advanceType] = row.split(',');
            
            // Find employee ID either directly or by name
            let actualEmployeeId = employeeId;
            if (!existingEmployees.some(e => e.id === employeeId)) {
              const idByName = employeeIdByName.get(employeeName.toLowerCase());
              if (idByName) {
                actualEmployeeId = idByName;
              } else {
                // Skip records without matching employee
                return;
              }
            }
            
            if (type.toLowerCase() === 'salary') {
              salaryRecords.push({
                id: id || Date.now().toString() + Math.random().toString(36).substring(2, 9),
                month: month,
                employeeId: actualEmployeeId,
                salary: parseFloat(amount),
                totalSales: parseFloat(amount) / 0.45, // Example calculation
                monthlyBankTransfers: 0,
                monthlyCashWithdrawn: 0,
                totalSalaryAdvance: 0,
                balanceCurrent: 0,
                balanceTillDate: 0
              });
            } else if (type.toLowerCase() === 'advance') {
              advanceRecords.push({
                id: id || Date.now().toString() + Math.random().toString(36).substring(2, 9),
                date: date,
                amount: parseFloat(amount),
                employeeId: actualEmployeeId,
                comments: comments,
                type: advanceType === 'bank' ? 'bank' : 'cash'
              });
            }
          });
        
        // Get existing data
        const existingSalaryJSON = localStorage.getItem('employeeSalaryData');
        const existingAdvancesJSON = localStorage.getItem('employeeSalaryAdvances');
        
        const existingSalary = existingSalaryJSON ? JSON.parse(existingSalaryJSON) : [];
        const existingAdvances = existingAdvancesJSON ? JSON.parse(existingAdvancesJSON) : [];
        
        // Merge data (avoid duplicates by ID)
        const existingSalaryIds = new Set(existingSalary.map(s => s.id));
        const newSalary = salaryRecords.filter(s => !existingSalaryIds.has(s.id));
        
        const existingAdvanceIds = new Set(existingAdvances.map(a => a.id));
        const newAdvances = advanceRecords.filter(a => !existingAdvanceIds.has(a.id));
        
        const updatedSalary = [...existingSalary, ...newSalary];
        const updatedAdvances = [...existingAdvances, ...newAdvances];
        
        localStorage.setItem('employeeSalaryData', JSON.stringify(updatedSalary));
        localStorage.setItem('employeeSalaryAdvances', JSON.stringify(updatedAdvances));
        
        toast.success(`Imported ${newSalary.length} salary records and ${newAdvances.length} advance records`);
        resolve();
      } catch (error) {
        console.error("Error parsing CSV:", error);
        toast.error("Failed to import salary data. Please check the CSV format");
        reject(error);
      }
    };
    
    reader.onerror = () => {
      toast.error("Error reading file");
      reject(new Error("Error reading file"));
    };
    
    reader.readAsText(csvFile);
  });
};

// Export sales data to CSV (reusing existing function from salesService.ts)
export const exportSalesDataToCSV = (): void => {
  // Import from salesService.ts to avoid code duplication
  const { getAllSalesRecords, recordsToCSV } = require('../services/salesService');
  
  const records = getAllSalesRecords();
  if (records.length === 0) {
    toast.error("No sales data to export");
    return;
  }
  
  const csv = recordsToCSV(records);
  downloadCSV(csv, `sales_records_${new Date().toISOString().split('T')[0]}.csv`);
  toast.success("Sales data exported successfully");
};

// Import sales data from CSV
export const importSalesDataFromCSV = (csvFile: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        const lines = csvData.split('\n');
        
        // Skip header row
        const headerRow = lines[0];
        const dataRows = lines.slice(1);
        
        // Parse header to get indexes
        const headers = headerRow.split(',');
        const getIndex = (fieldName: string) => headers.findIndex(h => h.trim() === fieldName);
        
        // Get indexes for each field
        const dateIndex = getIndex('Date');
        const openingCashIndex = getIndex('Opening Cash');
        const totalSalesPOSIndex = getIndex('Total POS Sales');
        const paytmSalesIndex = getIndex('Paytm Sales');
        // ... get indexes for other fields
        
        // Parse each row
        const salesRecords: SalesRecord[] = dataRows
          .filter(row => row.trim() !== '')
          .map(row => {
            const values = row.split(',');
            
            const record: SalesRecord = {
              date: values[dateIndex] || new Date().toISOString().split('T')[0],
              openingCash: parseFloat(values[openingCashIndex]) || 0,
              totalSalesPOS: parseFloat(values[totalSalesPOSIndex]) || 0,
              paytmSales: parseFloat(values[paytmSalesIndex]) || 0,
              employeeAdvances: {
                employee1: parseFloat(values[getIndex('Employee1 Advance')]) || 0,
                employee2: parseFloat(values[getIndex('Employee2 Advance')]) || 0,
                employee3: parseFloat(values[getIndex('Employee3 Advance')]) || 0,
                employee4: parseFloat(values[getIndex('Employee4 Advance')]) || 0
              },
              cleaningExpenses: parseFloat(values[getIndex('Cleaning Expenses')]) || 0,
              otherExpenses: {
                name1: values[getIndex('Other Expense 1 Name')] || '',
                amount1: parseFloat(values[getIndex('Other Expense 1 Amount')]) || 0,
                name2: values[getIndex('Other Expense 2 Name')] || '',
                amount2: parseFloat(values[getIndex('Other Expense 2 Amount')]) || 0
              },
              denominations: {
                d500: parseInt(values[getIndex('Rs.500 Count')]) || 0,
                d200: parseInt(values[getIndex('Rs.200 Count')]) || 0,
                d100: parseInt(values[getIndex('Rs.100 Count')]) || 0,
                d50: parseInt(values[getIndex('Rs.50 Count')]) || 0,
                d20: parseInt(values[getIndex('Rs.20 Count')]) || 0,
                d10: parseInt(values[getIndex('Rs.10 Count')]) || 0,
                d5: parseInt(values[getIndex('Rs.5 Count')]) || 0
              },
              cashWithdrawn: parseFloat(values[getIndex('Cash Withdrawn')]) || 0
            };
            
            // Calculate derived values
            return calculateDerivedValues(record);
          });
        
        // Get existing sales records
        const STORAGE_KEY = 'sales_records';
        const existingRecordsJSON = localStorage.getItem(STORAGE_KEY);
        const existingRecords: SalesRecord[] = existingRecordsJSON ? JSON.parse(existingRecordsJSON) : [];
        
        // Merge records (avoid duplicates by date)
        const existingDates = new Set(existingRecords.map(r => r.date));
        const newRecords = salesRecords.filter(r => !existingDates.has(r.date));
        
        const updatedRecords = [...existingRecords, ...newRecords];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
        
        toast.success(`Imported ${newRecords.length} new sales records`);
        resolve();
      } catch (error) {
        console.error("Error parsing CSV:", error);
        toast.error("Failed to import sales data. Please check the CSV format");
        reject(error);
      }
    };
    
    reader.onerror = () => {
      toast.error("Error reading file");
      reject(new Error("Error reading file"));
    };
    
    reader.readAsText(csvFile);
  });
};
