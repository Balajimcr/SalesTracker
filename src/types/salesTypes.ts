
export interface SalesRecord {
  date: string;
  openingCash: number;
  totalSalesPOS: number;
  paytmSales: number;
  employeeAdvances: {
    employee1: number;
    employee2: number;
    employee3: number;
    employee4: number;
  };
  cleaningExpenses: number;
  otherExpenses: {
    name1: string;
    amount1: number;
    name2: string;
    amount2: number;
  };
  denominations: {
    d500: number;
    d200: number;
    d100: number;
    d50: number;
    d20: number;
    d10: number;
    d5: number;
  };
  cashWithdrawn: number;
  totalExpenses?: number;
  totalFromDenominations?: number;
  closingCash?: number;
  totalCashSales?: number;
  totalCash?: number;
  cashDifference?: number;
}

export const emptySalesRecord: SalesRecord = {
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
