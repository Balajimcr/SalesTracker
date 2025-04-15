
import { SalesRecord } from "@/types/salesTypes";
import { calculateTotalFromDenominations } from "@/utils/salesCalculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FaRupeeSign, FaMoneyBillWave } from "react-icons/fa";

interface DenominationCounterProps {
  denominations: SalesRecord['denominations'];
  cashWithdrawn: number;
  onChange: (denominations: SalesRecord['denominations']) => void;
  onCashWithdrawnChange: (value: number) => void;
}

const DenominationCounter = ({ 
  denominations, 
  cashWithdrawn, 
  onChange, 
  onCashWithdrawnChange 
}: DenominationCounterProps) => {
  const handleChange = (key: keyof SalesRecord['denominations'], value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    onChange({
      ...denominations,
      [key]: isNaN(numValue) ? 0 : numValue
    });
  };

  const handleCashWithdrawnChange = (value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    onCashWithdrawnChange(isNaN(numValue) ? 0 : numValue);
  };

  const totalAmount = calculateTotalFromDenominations(denominations);
  const isExceeded = cashWithdrawn > totalAmount;

  // Array of denomination values and their keys for easy mapping
  const denominationItems = [
    { value: 500, key: 'd500' as keyof SalesRecord['denominations'] },
    { value: 200, key: 'd200' as keyof SalesRecord['denominations'] },
    { value: 100, key: 'd100' as keyof SalesRecord['denominations'] },
    { value: 50, key: 'd50' as keyof SalesRecord['denominations'] },
    { value: 20, key: 'd20' as keyof SalesRecord['denominations'] },
    { value: 10, key: 'd10' as keyof SalesRecord['denominations'] },
    { value: 5, key: 'd5' as keyof SalesRecord['denominations'] }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FaRupeeSign className="text-blue-500" />
          <span>Cash Denominations</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {denominationItems.map(({ value, key }) => (
            <div key={key} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
              <Label htmlFor={key} className="w-16 text-right">
                {value} x
              </Label>
              <Input
                id={key}
                type="number"
                min="0"
                value={denominations[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full text-left"
              />
              <div className="text-right text-sm font-medium w-24">
                <FaRupeeSign className="inline text-xs mr-1 text-muted-foreground" />
                <span>{(denominations[key] || 0) * value}</span>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t mt-6 flex justify-between items-center">
            <span className="font-medium">Total Amount:</span>
            <span className="text-xl font-bold text-blue-600 flex items-center">
              <FaRupeeSign className="mr-1" />
              {totalAmount.toLocaleString()}
            </span>
          </div>
          
          {/* Cash Withdrawal Section */}
          <div className="pt-4 border-t mt-6">
            <div className="grid grid-cols-[auto_1fr] items-center gap-3 mb-2">
              <Label htmlFor="cashWithdrawn" className="flex items-center gap-1">
                <FaMoneyBillWave className="text-sm text-blue-500" />
                <span>Cash Withdrawal</span>
              </Label>
              <Input
                id="cashWithdrawn"
                type="number"
                min="0"
                step="500"
                max={totalAmount}
                value={cashWithdrawn || ''}
                onChange={(e) => handleCashWithdrawnChange(e.target.value)}
                className={isExceeded ? "border-red-500" : ""}
              />
            </div>
            
            {isExceeded && (
              <div className="text-red-500 text-sm mt-2">
                Warning: Cash withdrawn exceeds the total cash available from denominations!
              </div>
            )}
            
            <div className="text-sm text-muted-foreground mt-2">
              Maximum withdrawal amount: ₹{totalAmount.toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DenominationCounter;
