
import { SalesRecord } from "@/types/salesTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FaCalendarAlt, FaRupeeSign, FaCreditCard } from "react-icons/fa";

interface SalesBasicInfoProps {
  data: Pick<SalesRecord, 'date' | 'openingCash' | 'totalSalesPOS' | 'paytmSales'>;
  onChange: (field: keyof SalesBasicInfoProps['data'], value: string | number) => void;
}

const SalesBasicInfo = ({ data, onChange }: SalesBasicInfoProps) => {
  const handleChange = (field: keyof SalesBasicInfoProps['data'], value: string) => {
    if (field === 'date') {
      onChange(field, value);
    } else {
      // Convert to number for numeric fields
      const numValue = value === '' ? 0 : parseFloat(value);
      onChange(field, isNaN(numValue) ? 0 : numValue);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FaCalendarAlt className="text-blue-500" />
          <span>Daily Sales Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr_2fr] items-center gap-3">
            <Label htmlFor="date" className="flex items-center gap-1">
              <FaCalendarAlt className="text-sm text-blue-500" />
              <span>Date</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={data.date}
              onChange={(e) => handleChange('date', e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-[1fr_2fr] items-center gap-3">
            <Label htmlFor="openingCash" className="flex items-center gap-1">
              <FaRupeeSign className="text-sm text-blue-500" />
              <span>Opening Cash</span>
            </Label>
            <Input
              id="openingCash"
              type="number"
              min="0"
              value={data.openingCash || ''}
              onChange={(e) => handleChange('openingCash', e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-[1fr_2fr] items-center gap-3">
            <Label htmlFor="totalSalesPOS" className="flex items-center gap-1">
              <FaCreditCard className="text-sm text-blue-500" />
              <span>Total POS Sales</span>
            </Label>
            <Input
              id="totalSalesPOS"
              type="number"
              min="0"
              value={data.totalSalesPOS || ''}
              onChange={(e) => handleChange('totalSalesPOS', e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-[1fr_2fr] items-center gap-3">
            <Label htmlFor="paytmSales" className="flex items-center gap-1">
              <FaCreditCard className="text-sm text-blue-500" />
              <span>Paytm Sales</span>
            </Label>
            <Input
              id="paytmSales"
              type="number"
              min="0"
              value={data.paytmSales || ''}
              onChange={(e) => handleChange('paytmSales', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesBasicInfo;
