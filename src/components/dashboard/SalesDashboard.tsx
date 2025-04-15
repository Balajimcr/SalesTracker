
import { useEffect, useState } from "react";
import { SalesRecord, emptySalesRecord } from "@/types/salesTypes";
import { getAllSalesRecords, saveSalesRecord } from "@/services/salesService";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalesBasicInfo from "./SalesBasicInfo";
import ExpensesForm from "./ExpensesForm";
import DenominationCounter from "./DenominationCounter";
import SalesSummary from "./SalesSummary";
import { FaCalendarAlt, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { toast } from "sonner";

const SalesDashboard = () => {
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<SalesRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecord, setEditedRecord] = useState<SalesRecord>(emptySalesRecord);
  const [viewMode, setViewMode] = useState<"details" | "summary">("details");

  useEffect(() => {
    loadSalesRecords();
  }, []);

  const loadSalesRecords = () => {
    const records = getAllSalesRecords();
    setSalesRecords(records);
    
    // Select the most recent record by default if available
    if (records.length > 0) {
      const sortedRecords = [...records].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setSelectedRecord(sortedRecords[0]);
    }
  };

  const handleDateSelect = (dateStr: string) => {
    const record = salesRecords.find(r => r.date === dateStr);
    if (record) {
      setSelectedRecord(record);
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
      loadSalesRecords(); // Reload all records
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
                  {salesRecords
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(record => (
                      <SelectItem key={record.date} value={record.date}>
                        {format(new Date(record.date), "MMMM d, yyyy")}
                      </SelectItem>
                    ))
                  }
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
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "details" | "summary")}>
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Detailed View</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details">
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
                        <DenominationDetails record={selectedRecord} />
                      </>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="summary">
                  <SalesSummary record={isEditing ? editedRecord : selectedRecord} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Static display components for read-only view
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

const DenominationDetails = ({ record }: { record: SalesRecord }) => {
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
        <CardTitle className="text-xl">Cash Denominations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {denominationItems.map(({ value, key }) => (
            <div key={key} className="flex justify-between py-1 border-b">
              <span>{`₹${value} × ${record.denominations[key] || 0}`}</span>
              <span className="font-medium">₹{((record.denominations[key] || 0) * value).toLocaleString()}</span>
            </div>
          ))}
          
          <div className="pt-4 flex justify-between items-center">
            <span className="font-medium">Total Amount:</span>
            <span className="text-xl font-bold text-blue-600">
              ₹{record.totalFromDenominations?.toLocaleString() || '0'}
            </span>
          </div>
          
          <div className="pt-4 flex justify-between border-t mt-2">
            <span className="font-medium">Closing Cash:</span>
            <span className="text-xl font-bold text-blue-600">
              ₹{record.closingCash?.toLocaleString() || '0'}
            </span>
          </div>
          
          <div className="pt-2 flex justify-between">
            <span className="font-medium">Cash Difference:</span>
            <span className={`text-lg font-bold ${(record.cashDifference || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
              ₹{record.cashDifference?.toLocaleString() || '0'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between py-1">
    <span className="text-gray-600">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

export default SalesDashboard;
