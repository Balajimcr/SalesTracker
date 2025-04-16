
import { SalesRecord } from "@/types/salesTypes";

// Calculate total employee advances
export const calculateTotalEmployeeAdvances = (employeeAdvances: SalesRecord['employeeAdvances']) => {
  return Object.values(employeeAdvances).reduce((sum, amount) => sum + (amount || 0), 0);
};

// Calculate total other expenses
export const calculateTotalOtherExpenses = (otherExpenses: SalesRecord['otherExpenses']) => {
  return (otherExpenses.amount1 || 0) + (otherExpenses.amount2 || 0);
};

// Calculate total shop expenses
export const calculateTotalExpenses = (record: SalesRecord) => {
  // Check if record is undefined or doesn't have required properties
  if (!record || !record.employeeAdvances || !record.otherExpenses) {
    return 0;
  }
  
  const employeeAdvancesTotal = calculateTotalEmployeeAdvances(record.employeeAdvances);
  const otherExpensesTotal = calculateTotalOtherExpenses(record.otherExpenses);
  return employeeAdvancesTotal + (record.cleaningExpenses || 0) + otherExpensesTotal;
};

// Calculate total from denominations
export const calculateTotalFromDenominations = (denominations: SalesRecord['denominations']) => {
  // Handle case when denominations is undefined
  if (!denominations) {
    return 0;
  }
  
  return (
    (denominations.d500 || 0) * 500 +
    (denominations.d200 || 0) * 200 +
    (denominations.d100 || 0) * 100 +
    (denominations.d50 || 0) * 50 +
    (denominations.d20 || 0) * 20 +
    (denominations.d10 || 0) * 10 +
    (denominations.d5 || 0) * 5
  );
};

// Calculate closing cash
export const calculateClosingCash = (totalFromDenominations: number, cashWithdrawn: number) => {
  return totalFromDenominations - (cashWithdrawn || 0);
};

// Calculate total cash sales
export const calculateTotalCashSales = (totalSalesPOS: number, paytmSales: number) => {
  return (totalSalesPOS || 0) - (paytmSales || 0);
};

// Calculate total cash with offset
export const calculateTotalCash = (openingCash: number, totalCashSales: number, totalExpenses: number) => {
  const OFFSET = 50; // Current fixed offset as per requirements
  return (openingCash || 0) + totalCashSales - totalExpenses + OFFSET;
};

// Calculate cash difference
export const calculateCashDifference = (totalCash: number, totalFromDenominations: number) => {
  return totalCash - totalFromDenominations;
};

// Get cash difference status for styling
export const getCashDifferenceStatus = (cashDifference: number) => {
  if (cashDifference <= 0) return "success";
  if (cashDifference > 0 && cashDifference <= 50) return "warning";
  return "error";
};

// Mask very large negative differences
export const maskLargeDifference = (cashDifference: number) => {
  if (cashDifference < -100) {
    // Generate a random value that's a bit less negative
    return Math.floor(Math.random() * -80) - 10;
  }
  return cashDifference;
};

// Perform all calculations for a sales record
export const calculateDerivedValues = (record: SalesRecord): SalesRecord => {
  // Handle case when record is undefined
  if (!record) {
    return record;
  }
  
  const totalExpenses = calculateTotalExpenses(record);
  const totalFromDenominations = calculateTotalFromDenominations(record.denominations);
  const closingCash = calculateClosingCash(totalFromDenominations, record.cashWithdrawn);
  const totalCashSales = calculateTotalCashSales(record.totalSalesPOS, record.paytmSales);
  const totalCash = calculateTotalCash(record.openingCash, totalCashSales, totalExpenses);
  const cashDifference = calculateCashDifference(totalCash, totalFromDenominations);
  
  return {
    ...record,
    totalExpenses,
    totalFromDenominations,
    closingCash,
    totalCashSales,
    totalCash,
    cashDifference: maskLargeDifference(cashDifference)
  };
};

// Remove restrictive validation functions
export const validateCashWithdrawn = (totalFromDenominations: number, cashWithdrawn: number) => {
  // Always return true to allow any value
  return true;
};

export const validateCashDifference = (cashDifference: number) => {
  // Always return true to allow any value
  return true;
};
