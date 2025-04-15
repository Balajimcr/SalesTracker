
import { useState } from "react";
import { SalesRecord, emptySalesRecord } from "@/types/salesTypes";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { saveSalesRecord, downloadRecordsAsCSV } from "@/services/salesService";
import { 
  calculateTotalFromDenominations, 
  validateCashWithdrawn,
  validateCashDifference,
  calculateDerivedValues 
} from "@/utils/salesCalculations";
import SalesBasicInfo from "./SalesBasicInfo";
import ExpensesForm from "./ExpensesForm";
import DenominationCounter from "./DenominationCounter";
import CashWithdrawal from "./CashWithdrawal";
import SalesSummary from "./SalesSummary";
import { FaSave, FaFileDownload, FaTrash } from "react-icons/fa";

const SalesEntryForm = () => {
  const [formData, setFormData] = useState<SalesRecord>(emptySalesRecord);
  
  // Get calculated values for validation
  const calculatedValues = calculateDerivedValues(formData);
  const totalFromDenominations = calculateTotalFromDenominations(formData.denominations);
  
  // Handle basic info changes
  const handleBasicInfoChange = (field: keyof Pick<SalesRecord, 'date' | 'openingCash' | 'totalSalesPOS' | 'paytmSales'>, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle expenses changes
  const handleExpensesChange = (
    type: 'employeeAdvances' | 'cleaningExpenses' | 'otherExpenses',
    field: string,
    value: string | number
  ) => {
    if (type === 'cleaningExpenses') {
      setFormData(prev => ({
        ...prev,
        cleaningExpenses: value as number
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          [field]: value
        }
      }));
    }
  };
  
  // Handle denominations changes
  const handleDenominationsChange = (denominations: SalesRecord['denominations']) => {
    setFormData(prev => ({
      ...prev,
      denominations
    }));
  };
  
  // Handle cash withdrawn changes
  const handleCashWithdrawnChange = (value: number) => {
    setFormData(prev => ({
      ...prev,
      cashWithdrawn: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate cash withdrawn
    if (!validateCashWithdrawn(totalFromDenominations, formData.cashWithdrawn)) {
      toast.error("Cash withdrawn cannot exceed total from denominations!");
      return;
    }
    
    // Validate cash difference
    const { cashDifference } = calculatedValues;
    if (!validateCashDifference(cashDifference || 0)) {
      toast.error("Large cash difference detected! Please contact the owner.");
      return;
    }
    
    // Save the record
    try {
      saveSalesRecord(formData);
      toast.success("Sales record saved successfully!");
      setFormData(emptySalesRecord); // Reset form
    } catch (error) {
      toast.error("Failed to save sales record. Please try again.");
      console.error("Error saving record:", error);
    }
  };
  
  // Handle reset
  const handleReset = () => {
    setFormData(emptySalesRecord);
    toast.info("Form has been reset.");
  };
  
  // Handle CSV download
  const handleDownloadCSV = () => {
    downloadRecordsAsCSV();
    toast.success("Sales records downloaded as CSV.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <SalesBasicInfo 
            data={{
              date: formData.date,
              openingCash: formData.openingCash,
              totalSalesPOS: formData.totalSalesPOS,
              paytmSales: formData.paytmSales
            }}
            onChange={handleBasicInfoChange}
          />
          
          <ExpensesForm 
            data={{
              employeeAdvances: formData.employeeAdvances,
              cleaningExpenses: formData.cleaningExpenses,
              otherExpenses: formData.otherExpenses
            }}
            onChange={handleExpensesChange}
          />
        </div>
        
        <div className="space-y-6">
          <DenominationCounter 
            denominations={formData.denominations}
            onChange={handleDenominationsChange}
          />
          
          <CashWithdrawal 
            cashWithdrawn={formData.cashWithdrawn}
            totalFromDenominations={totalFromDenominations}
            onChange={handleCashWithdrawnChange}
          />
          
          <SalesSummary data={formData} />
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-6 border-t">
        <div>
          <Button type="button" variant="outline" onClick={handleReset} className="mr-2">
            <FaTrash className="mr-2" />
            Reset
          </Button>
          <Button type="button" variant="outline" onClick={handleDownloadCSV}>
            <FaFileDownload className="mr-2" />
            Download CSV
          </Button>
        </div>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          <FaSave className="mr-2" />
          Save Record
        </Button>
      </div>
    </form>
  );
};

export default SalesEntryForm;
