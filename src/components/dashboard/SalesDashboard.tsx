import React, { useEffect, useState } from 'react';
import { SalesRecord, emptySalesRecord } from "@/types/salesTypes";
import { getAllSalesRecords, saveSalesRecord } from "@/services/salesService";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaCalendarAlt, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { toast } from "sonner";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import RecordDetails from './RecordDetails';
import DetailedSummary from './DetailedSummary';

const SalesDashboard = () => {
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<SalesRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecord, setEditedRecord] = useState<SalesRecord>(emptySalesRecord);
  const [viewMode, setViewMode] = useState<"details" | "summary">("details");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadSalesRecords();
  }, []);

  const loadSalesRecords = () => {
    const records = getAllSalesRecords();
    setSalesRecords(records);
    
    if (records.length > 0) {
      const sortedRecords = [...records].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setSelectedRecord(sortedRecords[0]);
      setCurrentIndex(0);
    }
  };

  const handleDateSelect = (dateStr: string) => {
    const record = salesRecords.find(r => r.date === dateStr);
    if (record) {
      setSelectedRecord(record);
      const index = salesRecords.findIndex(r => r.date === dateStr);
      setCurrentIndex(index >= 0 ? index : 0);
      setIsEditing(false);
    }
  };

  const handleEditStart = () => {
    if (selectedRecord) {
      setEditedRecord({...selectedRecord});
      setIsEditing(true);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleEditSave = () => {
    try {
      saveSalesRecord(editedRecord);
      loadSalesRecords();
      setIsEditing(false);
      toast.success("Sales record updated successfully");
    } catch (error) {
      toast.error("Failed to update record");
      console.error("Save error:", error);
    }
  };

  const handleBasicInfoChange = (field: keyof Pick<SalesRecord, 'date' | 'openingCash' | 'totalSalesPOS' | 'paytmSales'>, value: string | number) => {
    setEditedRecord(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExpensesChange = (
    type: 'employeeAdvances' | 'cleaningExpenses' | 'otherExpenses',
    field: string,
    value: string | number
  ) => {
    setEditedRecord(prev => {
      if (type === 'cleaningExpenses') {
        return {
          ...prev,
          cleaningExpenses: typeof value === 'string' ? parseFloat(value) : value
        };
      } else {
        return {
          ...prev,
          [type]: {
            ...prev[type],
            [field]: value
          }
        };
      }
    });
  };

  const handleDenominationsChange = (denominations: SalesRecord['denominations']) => {
    setEditedRecord(prev => ({
      ...prev,
      denominations
    }));
  };

  const handleCashWithdrawnChange = (value: number) => {
    setEditedRecord(prev => ({
      ...prev,
      cashWithdrawn: value
    }));
  };

  const handleIndexChange = (index: number) => {
    if (index >= 0 && index < salesRecords.length) {
      setCurrentIndex(index);
      setSelectedRecord(salesRecords[index]);
      setIsEditing(false);
    }
  };

  const sortedRecords = [...salesRecords].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (salesRecords.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Sales Dashboard</CardTitle>
          <CardDescription>No sales records found. Add some sales records first.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <FaCalendarAlt className="text-blue-500" />
              <span>Sales Records Dashboard</span>
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select 
                value={selectedRecord?.date || ''} 
                onValueChange={handleDateSelect}
              >
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Select a date" />
                </SelectTrigger>
                <SelectContent>
                  {sortedRecords.map(record => (
                    <SelectItem key={record.date} value={record.date}>
                      {format(new Date(record.date), "MMMM d, yyyy")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!isEditing && (
                <Button onClick={handleEditStart} className="flex items-center gap-2">
                  <FaEdit />
                  <span>Edit</span>
                </Button>
              )}
              {isEditing && (
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={handleEditSave} 
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <FaSave />
                    <span>Save</span>
                  </Button>
                  <Button 
                    onClick={handleEditCancel} 
                    variant="outline" 
                    className="flex items-center gap-2"
                  >
                    <FaTimes />
                    <span>Cancel</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedRecord && (
            <div className="space-y-6">
              {/* Index-based Navigation */}
              <div className="w-full flex justify-center my-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handleIndexChange(currentIndex - 1)}
                        className={currentIndex <= 0 ? "opacity-50 pointer-events-none" : ""}
                      />
                    </PaginationItem>
                    
                    <PaginationItem>
                      <span className="flex items-center px-4 font-medium">
                        {currentIndex + 1} of {salesRecords.length}
                      </span>
                    </PaginationItem>
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handleIndexChange(currentIndex + 1)}
                        className={currentIndex >= salesRecords.length - 1 ? "opacity-50 pointer-events-none" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Show either the editing form or the static display */}
                {isEditing ? (
                  <>
                    <SalesBasicInfo 
                      data={{
                        date: editedRecord.date,
                        openingCash: editedRecord.openingCash,
                        totalSalesPOS: editedRecord.totalSalesPOS,
                        paytmSales: editedRecord.paytmSales
                      }}
                      onChange={handleBasicInfoChange}
                    />
                    <ExpensesForm 
                      data={{
                        employeeAdvances: editedRecord.employeeAdvances,
                        cleaningExpenses: editedRecord.cleaningExpenses,
                        otherExpenses: editedRecord.otherExpenses
                      }}
                      onChange={handleExpensesChange}
                    />
                    <DenominationCounter 
                      denominations={editedRecord.denominations}
                      cashWithdrawn={editedRecord.cashWithdrawn}
                      onChange={handleDenominationsChange}
                      onCashWithdrawnChange={handleCashWithdrawnChange}
                    />
                  </>
                ) : (
                  <>
                    <RecordDetails record={selectedRecord} />
                    <DetailedSummary record={selectedRecord} />
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

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

const DetailedSummary = ({ record }: { record: SalesRecord }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Financial Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
              <p className="text-sm text-amber-600">Please verify your calculations and denominatio counts.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

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

export default SalesDashboard;
