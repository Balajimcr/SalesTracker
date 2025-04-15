
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
          <div className="flex justify-between items-center py-3 mt-2">
            <span className="font-bold text-lg">Difference:</span>
            <span className={`text-2xl font-bold flex items-center ${statusColors[differenceStatus]}`}>
              <FaRupeeSign className="mr-1" />
              {displayCashDifference.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesSummary;

