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
          .map((row, index) => {
            const [name, mobile, joiningDate] = row.split(',');
            return {
              id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
              name: name.trim(),
              mobile: mobile.trim(),
              joiningDate: joiningDate.trim(),
              employeeNumber: index + 1 // Assign sequential employee numbers
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
        
        // Parse header to get indexes for each field
        const headers = headerRow.split(',').map(h => h.trim());
        
        // Create a helper function to find the index of a header
        const getIndex = (fieldName: string): number => {
          // Try exact match first
          let index = headers.findIndex(h => h === fieldName);
          
          // If not found, try case-insensitive match
          if (index === -1) {
            index = headers.findIndex(h => h.toLowerCase() === fieldName.toLowerCase());
          }
          
          // If still not found, try with spaces removed
          if (index === -1) {
            const normalizedName = fieldName.replace(/\s+/g, '').toLowerCase();
            index = headers.findIndex(h => h.replace(/\s+/g, '').toLowerCase() === normalizedName);
          }
          
          return index;
        };
        
        // Map common headers to our field names
        const dateIndex = getIndex('Date') !== -1 ? getIndex('Date') : getIndex('date');
        const openingCashIndex = getIndex('Opening Cash') !== -1 ? getIndex('Opening Cash') : getIndex('openingCash');
        const totalSalesPOSIndex = getIndex('Total POS Sales') !== -1 ? getIndex('Total POS Sales') : getIndex('totalSalesPOS');
        const paytmSalesIndex = getIndex('Paytm Sales') !== -1 ? getIndex('Paytm Sales') : getIndex('paytmSales');
        
        // Parse each row
        const salesRecords: SalesRecord[] = [];
        
        for (let i = 0; i < dataRows.length; i++) {
          const row = dataRows[i].trim();
          if (!row) continue; // Skip empty rows
          
          // Split the row into values
          // Handle values that might contain commas within quotes
          const values: string[] = [];
          let inQuotes = false;
          let currentValue = '';
          
          for (let j = 0; j < row.length; j++) {
            const char = row[j];
            
            if (char === '"' && (j === 0 || row[j-1] !== '\\')) {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(currentValue);
              currentValue = '';
            } else {
              currentValue += char;
            }
          }
          values.push(currentValue); // Add the last value
          
          // Create a record with default values
          const record: SalesRecord = {
            date: new Date().toISOString().split('T')[0],
            openingCash: 0,
            totalSalesPOS: 0,
            paytmSales: 0,
            employeeAdvances: {
              employee1: 0,
              employee2: 0,
              employee3: 0,
              employee4: 0
            },
            cleaningExpenses: 0,
            otherExpenses: {
              name1: '',
              amount1: 0,
              name2: '',
              amount2: 0
            },
            denominations: {
              d500: 0,
              d200: 0,
              d100: 0,
              d50: 0,
              d20: 0,
              d10: 0,
              d5: 0
            },
            cashWithdrawn: 0
          };
          
          // Set values based on the CSV columns
          if (dateIndex !== -1 && values[dateIndex]) {
            record.date = values[dateIndex].trim();
          }
          
          if (openingCashIndex !== -1 && values[openingCashIndex]) {
            record.openingCash = parseFloat(values[openingCashIndex]) || 0;
          }
          
          if (totalSalesPOSIndex !== -1 && values[totalSalesPOSIndex]) {
            record.totalSalesPOS = parseFloat(values[totalSalesPOSIndex]) || 0;
          }
          
          if (paytmSalesIndex !== -1 && values[paytmSalesIndex]) {
            record.paytmSales = parseFloat(values[paytmSalesIndex]) || 0;
          }
          
          // Employee advances
          const emp1Index = getIndex('Employee1 Advance');
          const emp2Index = getIndex('Employee2 Advance');
          const emp3Index = getIndex('Employee3 Advance');
          const emp4Index = getIndex('Employee4 Advance');
          
          if (emp1Index !== -1 && values[emp1Index]) {
            record.employeeAdvances.employee1 = parseFloat(values[emp1Index]) || 0;
          }
          
          if (emp2Index !== -1 && values[emp2Index]) {
            record.employeeAdvances.employee2 = parseFloat(values[emp2Index]) || 0;
          }
          
          if (emp3Index !== -1 && values[emp3Index]) {
            record.employeeAdvances.employee3 = parseFloat(values[emp3Index]) || 0;
          }
          
          if (emp4Index !== -1 && values[emp4Index]) {
            record.employeeAdvances.employee4 = parseFloat(values[emp4Index]) || 0;
          }
          
          // Cleaning expenses
          const cleaningIndex = getIndex('Cleaning Expenses');
          if (cleaningIndex !== -1 && values[cleaningIndex]) {
            record.cleaningExpenses = parseFloat(values[cleaningIndex]) || 0;
          }
          
          // Other expenses
          const otherExp1NameIndex = getIndex('Other Expense 1 Name');
          const otherExp1AmountIndex = getIndex('Other Expense 1 Amount');
          const otherExp2NameIndex = getIndex('Other Expense 2 Name');
          const otherExp2AmountIndex = getIndex('Other Expense 2 Amount');
          
          if (otherExp1NameIndex !== -1 && values[otherExp1NameIndex]) {
            record.otherExpenses.name1 = values[otherExp1NameIndex];
          }
          
          if (otherExp1AmountIndex !== -1 && values[otherExp1AmountIndex]) {
            record.otherExpenses.amount1 = parseFloat(values[otherExp1AmountIndex]) || 0;
          }
          
          if (otherExp2NameIndex !== -1 && values[otherExp2NameIndex]) {
            record.otherExpenses.name2 = values[otherExp2NameIndex];
          }
          
          if (otherExp2AmountIndex !== -1 && values[otherExp2AmountIndex]) {
            record.otherExpenses.amount2 = parseFloat(values[otherExp2AmountIndex]) || 0;
          }
          
          // Denominations
          const d500Index = getIndex('Rs.500 Count');
          const d200Index = getIndex('Rs.200 Count');
          const d100Index = getIndex('Rs.100 Count');
          const d50Index = getIndex('Rs.50 Count');
          const d20Index = getIndex('Rs.20 Count');
          const d10Index = getIndex('Rs.10 Count');
          const d5Index = getIndex('Rs.5 Count');
          
          if (d500Index !== -1 && values[d500Index]) {
            record.denominations.d500 = parseInt(values[d500Index]) || 0;
          }
          
          if (d200Index !== -1 && values[d200Index]) {
            record.denominations.d200 = parseInt(values[d200Index]) || 0;
          }
          
          if (d100Index !== -1 && values[d100Index]) {
            record.denominations.d100 = parseInt(values[d100Index]) || 0;
          }
          
          if (d50Index !== -1 && values[d50Index]) {
            record.denominations.d50 = parseInt(values[d50Index]) || 0;
          }
          
          if (d20Index !== -1 && values[d20Index]) {
            record.denominations.d20 = parseInt(values[d20Index]) || 0;
          }
          
          if (d10Index !== -1 && values[d10Index]) {
            record.denominations.d10 = parseInt(values[d10Index]) || 0;
          }
          
          if (d5Index !== -1 && values[d5Index]) {
            record.denominations.d5 = parseInt(values[d5Index]) || 0;
          }
          
          // Cash withdrawn
          const cashWithdrawnIndex = getIndex('Cash Withdrawn');
          if (cashWithdrawnIndex !== -1 && values[cashWithdrawnIndex]) {
            record.cashWithdrawn = parseFloat(values[cashWithdrawnIndex]) || 0;
          }
          
          // Calculate derived values
          const processedRecord = calculateDerivedValues(record);
          salesRecords.push(processedRecord);
        }
        
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
