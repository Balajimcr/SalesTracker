
import { SalesRecord } from "@/types/salesTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FaMoneyBillWave } from "react-icons/fa";

interface CashWithdrawalProps {
  cashWithdrawn: number;
  totalFromDenominations: number;
  onChange: (value: number) => void;
}

const CashWithdrawal = ({ cashWithdrawn, totalFromDenominations, onChange }: CashWithdrawalProps) => {
  const handleChange = (value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    onChange(isNaN(numValue) ? 0 : numValue);
  };

  const isExceeded = cashWithdrawn > totalFromDenominations;

  return (
    <Card className={isExceeded ? "border-red-500" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FaMoneyBillWave className="text-blue-500" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr_2fr] items-center gap-3">
            <Label htmlFor="cashWithdrawn" className="flex items-center gap-1">
              <FaMoneyBillWave className="text-sm text-blue-500" />
              <span>Cash Withdrawal</span>
            </Label>
            <Input
              id="cashWithdrawn"
              type="number"
              min="0"
              max={totalFromDenominations}
              value={cashWithdrawn || ''}
              onChange={(e) => handleChange(e.target.value)}
              className={isExceeded ? "border-red-500" : ""}
            />
          </div>
          
          {isExceeded && (
            <div className="text-red-500 text-sm mt-2">
              Warning: Cash withdrawn exceeds the total cash available from denominations!
            </div>
          )}
          
          <div className="text-sm text-muted-foreground mt-2">
            Maximum withdrawal amount: ₹{totalFromDenominations.toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CashWithdrawal;
