import React, { useEffect, useState } from 'react';
import { SalesRecord, emptySalesRecord } from "@/types/salesTypes";
import { getSalesRecordsForActiveStore } from "@/services/salesService";
import { format, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FaCalendarAlt, FaEdit, FaSave, FaTimes, FaTable } from "react-icons/fa";
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
import SalesBasicInfo from './SalesBasicInfo';
import ExpensesForm from './ExpensesForm';
import DenominationCounter from './DenominationCounter';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SalesDashboard = () => {
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<SalesRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecord, setEditedRecord] = useState<SalesRecord>(emptySalesRecord);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullTable, setShowFullTable] = useState(false);

  useEffect(() => {
    loadSalesRecords();
  }, []);

  const loadSalesRecords = () => {
    const records = getSalesRecordsForActiveStore(); // Use store-specific records
    setSalesRecords(records);
    
    if (records.length > 0) {
      const sortedRecords = [...records].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (isValid(dateA) && isValid(dateB)) {
          return dateB.getTime() - dateA.getTime();
        }
        if (!isValid(dateA)) return 1;
        if (!isValid(dateB)) return -1;
        return 0;
      });
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isValid(date)) {
        return format(date, "dd-MMM-yy");
      }
      return "Invalid date";
    } catch (error) {
      console.error("Date formatting error:", error, "for date:", dateString);
      return "Invalid date";
    }
  };

  const sortedRecords = [...salesRecords].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (isValid(dateA) && isValid(dateB)) {
      return dateB.getTime() - dateA.getTime();
    }
    if (!isValid(dateA)) return 1;
    if (!isValid(dateB)) return -1;
    return 0;
  });

  if (salesRecords.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Sales Dashboard</CardTitle>
          <CardDescription>No sales records found for the active store. Add some sales records first.</CardDescription>
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
                  {sortedRecords.map(record => {
                    const date = new Date(record.date);
                    return isValid(date) ? (
                      <SelectItem key={record.date} value={record.date}>
                        {format(date, "MMMM d, yyyy")}
                      </SelectItem>
                    ) : (
                      <SelectItem key={record.date} value={record.date}>
                        Invalid date
                      </SelectItem>
                    );
                  })}
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

      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <FaTable className="text-blue-500" />
              <span>Sales Records Data Table</span>
            </CardTitle>
            <Button 
              variant="outline" 
              onClick={() => setShowFullTable(!showFullTable)}
            >
              {showFullTable ? "Hide Details" : "Show Details"}
            </Button>
          </div>
        </CardHeader>
        {showFullTable && (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-100 sticky top-0">
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Date</TableHead>
                    <TableHead className="whitespace-nowrap">Opening Cash</TableHead>
                    <TableHead className="whitespace-nowrap">Expenses Shop</TableHead>
                    <TableHead className="whitespace-nowrap">Denomination Total</TableHead>
                    <TableHead className="whitespace-nowrap">Total Cash</TableHead>
                    <TableHead className="whitespace-nowrap">Total Sales POS</TableHead>
                    <TableHead className="whitespace-nowrap">Paytm</TableHead>
                    <TableHead className="whitespace-nowrap">Cash Withdrawn</TableHead>
                    <TableHead className="whitespace-nowrap">Employee 1</TableHead>
                    <TableHead className="whitespace-nowrap">Employee 2</TableHead>
                    <TableHead className="whitespace-nowrap">Employee 3</TableHead>
                    <TableHead className="whitespace-nowrap">Employee 4</TableHead>
                    <TableHead className="whitespace-nowrap">Cleaning</TableHead>
                    <TableHead className="whitespace-nowrap">Other Expenses Name</TableHead>
                    <TableHead className="whitespace-nowrap">Other Expenses Amount</TableHead>
                    <TableHead className="whitespace-nowrap">Other Expenses Name_1</TableHead>
                    <TableHead className="whitespace-nowrap">Other Expenses Amount_1</TableHead>
                    <TableHead className="whitespace-nowrap">500</TableHead>
                    <TableHead className="whitespace-nowrap">200</TableHead>
                    <TableHead className="whitespace-nowrap">100</TableHead>
                    <TableHead className="whitespace-nowrap">50</TableHead>
                    <TableHead className="whitespace-nowrap">20</TableHead>
                    <TableHead className="whitespace-nowrap">10</TableHead>
                    <TableHead className="whitespace-nowrap">5</TableHead>
                    <TableHead className="whitespace-nowrap">Cash Difference</TableHead>
                    <TableHead className="whitespace-nowrap">Closing Cash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRecords.map((record, index) => (
                    <TableRow key={index} className={index === currentIndex ? "bg-blue-50" : ""}>
                      <TableCell className="whitespace-nowrap">{formatDate(record.date)}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.openingCash}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.totalExpenses}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.totalFromDenominations}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.totalCash}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.totalSalesPOS}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.paytmSales}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.cashWithdrawn}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.employeeAdvances.employee1}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.employeeAdvances.employee2}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.employeeAdvances.employee3}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.employeeAdvances.employee4}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.cleaningExpenses}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.otherExpenses.name1}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.otherExpenses.amount1}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.otherExpenses.name2}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.otherExpenses.amount2}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.denominations.d500}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.denominations.d200}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.denominations.d100}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.denominations.d50}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.denominations.d20}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.denominations.d10}</TableCell>
                      <TableCell className="whitespace-nowrap">{record.denominations.d5}</TableCell>
                      <TableCell 
                        className={`whitespace-nowrap ${
                          (record.cashDifference || 0) < 0 
                            ? "text-red-600" 
                            : (record.cashDifference || 0) > 0 
                              ? "text-blue-600" 
                              : ""
                        }`}
                      >
                        {record.cashDifference}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{record.closingCash}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
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
