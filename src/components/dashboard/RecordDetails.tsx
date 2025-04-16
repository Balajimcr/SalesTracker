
import React from 'react';
import { SalesRecord } from "@/types/salesTypes";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

const RecordDetails = ({ record }: { record: SalesRecord }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Sales Record Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <DetailItem label="Date" value={format(new Date(record.date), "MMMM d, yyyy")} />
          <DetailItem label="Opening Cash" value={`₹${record.openingCash.toLocaleString()}`} />
          <DetailItem label="Total POS Sales" value={`₹${record.totalSalesPOS.toLocaleString()}`} />
          <DetailItem label="Paytm Sales" value={`₹${record.paytmSales.toLocaleString()}`} />
          
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Employee Advances</h3>
            <div className="grid grid-cols-2 gap-2">
              <DetailItem label="Employee 1" value={`₹${record.employeeAdvances.employee1.toLocaleString()}`} />
              <DetailItem label="Employee 2" value={`₹${record.employeeAdvances.employee2.toLocaleString()}`} />
              <DetailItem label="Employee 3" value={`₹${record.employeeAdvances.employee3.toLocaleString()}`} />
              <DetailItem label="Employee 4" value={`₹${record.employeeAdvances.employee4.toLocaleString()}`} />
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Expenses</h3>
            <DetailItem label="Cleaning Expenses" value={`₹${record.cleaningExpenses.toLocaleString()}`} />
            {record.otherExpenses.name1 && (
              <DetailItem 
                label={record.otherExpenses.name1} 
                value={`₹${record.otherExpenses.amount1.toLocaleString()}`} 
              />
            )}
            {record.otherExpenses.name2 && (
              <DetailItem 
                label={record.otherExpenses.name2} 
                value={`₹${record.otherExpenses.amount2.toLocaleString()}`} 
              />
            )}
          </div>
          
          <div className="pt-4 border-t">
            <DetailItem label="Cash Withdrawn" value={`₹${record.cashWithdrawn.toLocaleString()}`} />
            <DetailItem label="Total Expenses" value={`₹${record.totalExpenses?.toLocaleString() || '0'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordDetails;
