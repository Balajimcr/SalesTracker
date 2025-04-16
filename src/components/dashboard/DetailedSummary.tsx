
import React from 'react';
import { SalesRecord } from "@/types/salesTypes";
import { 
  calculateTotalExpenses,
  calculateTotalFromDenominations,
  calculateClosingCash,
  calculateTotalCashSales,
  calculateTotalCash,
  calculateCashDifference,
  getCashDifferenceStatus,
  maskLargeDifference
} from "@/utils/salesCalculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaRupeeSign } from "react-icons/fa";

const DetailItem = ({ 
  label, 
  value,
  className = "" 
}: { 
  label: string; 
  value: string;
  className?: string;
}) => (
  <div className="flex justify-between py-1">
    <span className="text-gray-600">{label}</span>
    <span className={`font-medium ${className}`}>{value}</span>
  </div>
);

const DetailedSummary = ({ record }: { record: SalesRecord }) => {
  // Calculate all derived values
  const totalExpenses = calculateTotalExpenses(record);
  const totalFromDenominations = calculateTotalFromDenominations(record.denominations);
  const closingCash = calculateClosingCash(totalFromDenominations, record.cashWithdrawn);
  const totalCashSales = calculateTotalCashSales(record.totalSalesPOS, record.paytmSales);
  const totalCash = calculateTotalCash(record.openingCash, totalCashSales, totalExpenses);
  let cashDifference = calculateCashDifference(totalCash, totalFromDenominations);
  
  // Apply masking for large negative differences
  const displayCashDifference = maskLargeDifference(cashDifference);
  
  // Get status for styling
  const differenceStatus = getCashDifferenceStatus(cashDifference);
  
  // Color mapping for status
  const statusColors = {
    success: "text-green-500",
    warning: "text-blue-500",
    error: "text-red-500"
  };
  
  // Warning for large difference
  const showLargeWarning = Math.abs(cashDifference) > 1000;

  const summaryItems = [
    { label: "Total Sales", value: record.totalSalesPOS },
    { label: "Cash", value: totalCashSales },
    { label: "Total Cash", value: totalCash },
    { label: "Closing Cash", value: closingCash }
  ];

  return (
    <Card className="bg-slate-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Financial Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <h3 className="font-medium col-span-2 border-b pb-1">Cash Flow Breakdown</h3>
            <DetailItem label="Opening Balance" value={`₹${record.openingCash.toLocaleString()}`} />
            <DetailItem label="Total POS Sales" value={`₹${record.totalSalesPOS.toLocaleString()}`} />
            <DetailItem label="Paytm Sales" value={`₹${(record.paytmSales).toLocaleString()}`} />
            <DetailItem label="Cash Sales" value={`₹${(record.totalCashSales || 0).toLocaleString()}`} />
            <DetailItem label="Total Expenses" value={`₹${(record.totalExpenses || 0).toLocaleString()}`} />
            <DetailItem label="Cash Withdrawn" value={`₹${record.cashWithdrawn.toLocaleString()}`} />
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Final Calculations</h3>
            <div className="space-y-2">
              <DetailItem 
                label="Expected Cash" 
                value={`₹${(record.totalCash || 0).toLocaleString()}`} 
                className="text-blue-600"
              />
              <DetailItem 
                label="Actual Cash (Denominations)" 
                value={`₹${(record.totalFromDenominations || 0).toLocaleString()}`} 
                className="text-blue-600"
              />
              <DetailItem 
                label="Closing Cash" 
                value={`₹${(record.closingCash || 0).toLocaleString()}`} 
                className="font-bold text-lg"
              />
              <DetailItem 
                label="Cash Difference" 
                value={`₹${(record.cashDifference || 0).toLocaleString()}`} 
                className={`font-bold text-lg ${(record.cashDifference || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}
              />
            </div>
          </div>
          
          {Math.abs(record.cashDifference || 0) > 100 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-amber-700 font-medium">Significant cash difference detected!</p>
              <p className="text-sm text-amber-600">Please verify your calculations and denomination counts.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DetailedSummary;
