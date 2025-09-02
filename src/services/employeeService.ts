import { Employee } from "@/components/dashboard/EmployeeManagement";

const EMPLOYEES_STORAGE_KEY = 'employees_by_store';

// Get all employees for a specific store
export const getEmployeesByStore = (storeId: string): Employee[] => {
  const allEmployees = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
  if (!allEmployees) return [];
  
  const employeesByStore = JSON.parse(allEmployees);
  return employeesByStore[storeId] || [];
};

// Save employees for a specific store
export const saveEmployeesForStore = (storeId: string, employees: Employee[]): void => {
  const allEmployees = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
  const employeesByStore = allEmployees ? JSON.parse(allEmployees) : {};
  
  employeesByStore[storeId] = employees;
  localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employeesByStore));
};

// Migrate old employee data to store-specific format
export const migrateOldEmployeeData = (storeId: string): void => {
  const oldEmployees = localStorage.getItem('employees');
  if (oldEmployees && !localStorage.getItem(EMPLOYEES_STORAGE_KEY)) {
    const employees = JSON.parse(oldEmployees);
    saveEmployeesForStore(storeId, employees);
    localStorage.removeItem('employees');
  }
};

// Get all employees across all stores
export const getAllEmployees = (): { [storeId: string]: Employee[] } => {
  const allEmployees = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
  return allEmployees ? JSON.parse(allEmployees) : {};
};

// Delete employee from a specific store
export const deleteEmployeeFromStore = (storeId: string, employeeId: string): void => {
  const employees = getEmployeesByStore(storeId);
  const updatedEmployees = employees.filter(emp => emp.id !== employeeId);
  saveEmployeesForStore(storeId, updatedEmployees);
};

// Add or update employee for a specific store
export const saveEmployeeForStore = (storeId: string, employee: Employee): void => {
  const employees = getEmployeesByStore(storeId);
  const existingIndex = employees.findIndex(emp => emp.id === employee.id);
  
  if (existingIndex >= 0) {
    employees[existingIndex] = employee;
  } else {
    employees.push(employee);
  }
  
  saveEmployeesForStore(storeId, employees);
};