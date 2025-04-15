
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
import { FaChartLine, FaRupeeSign } from "react-icons/fa";

interface SalesSummaryProps {
  data: SalesRecord;
}

const SalesSummary = ({ data }: SalesSummaryProps) => {
  // Calculate all derived values
  const totalExpenses = calculateTotalExpenses(data);
  const totalFromDenominations = calculateTotalFromDenominations(data.denominations);
  const closingCash = calculateClosingCash(totalFromDenominations, data.cashWithdrawn);
  const totalCashSales = calculateTotalCashSales(data.totalSalesPOS, data.paytmSales);
  const totalCash = calculateTotalCash(data.openingCash, totalCashSales, totalExpenses);
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
    { label: "Total Sales", value: data.totalSalesPOS },
    { label: "Cash", value: totalCashSales },
    { label: "Total Cash", value: totalCash },
    { label: "Closing Cash", value: closingCash }
  ];

  return (
    <Card className="bg-slate-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FaChartLine className="text-blue-500" />
          <span>Daily Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {summaryItems.map((item) => (
            <div key={item.label} className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">{item.label}:</span>
              <span className="text-lg font-semibold flex items-center">
                <FaRupeeSign className="mr-1 text-sm" />
                {item.value.toLocaleString()}
              </span>
            </div>
          ))}
          
          <div className="flex justify-between items-center py-3 mt-2">
            <span className="font-bold text-lg">Difference:</span>
            <span className={`text-2xl font-bold flex items-center ${statusColors[differenceStatus]}`}>
              <FaRupeeSign className="mr-1" />
              {displayCashDifference.toLocaleString()}
            </span>
          </div>
          
          {showLargeWarning && (
            <div className="bg-red-100 text-red-800 p-3 rounded-md mt-4">
              <p className="font-bold">Warning: Large Cash Difference Detected!</p>
              <p className="text-sm mt-1">Please contact the owner immediately.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesSummary;

