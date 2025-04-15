import { SalesRecord } from "@/types/salesTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FaUserFriends, FaBroom, FaReceipt } from "react-icons/fa";
import { calculateTotalExpenses } from "@/utils/salesCalculations";

interface ExpensesFormProps {
  data: Pick<SalesRecord, 'employeeAdvances' | 'cleaningExpenses' | 'otherExpenses'>;
  onChange: (
    type: 'employeeAdvances' | 'cleaningExpenses' | 'otherExpenses',
    field: string,
    value: string | number
  ) => void;
}

const ExpensesForm = ({ data, onChange }: ExpensesFormProps) => {
  const handleEmployeeChange = (employee: keyof SalesRecord['employeeAdvances'], value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    onChange('employeeAdvances', employee, isNaN(numValue) ? 0 : numValue);
  };

  const handleCleaningChange = (value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    onChange('cleaningExpenses', 'cleaningExpenses', isNaN(numValue) ? 0 : numValue);
  };

  const handleOtherExpenseChange = (
    field: 'name1' | 'amount1' | 'name2' | 'amount2',
    value: string
  ) => {
    if (field === 'name1' || field === 'name2') {
      onChange('otherExpenses', field, value);
    } else {
      const numValue = value === '' ? 0 : parseFloat(value);
      onChange('otherExpenses', field, isNaN(numValue) ? 0 : numValue);
    }
  };

  const totalExpenses = calculateTotalExpenses({
    employeeAdvances: data.employeeAdvances,
    cleaningExpenses: data.cleaningExpenses,
    otherExpenses: data.otherExpenses
  } as SalesRecord);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FaReceipt className="text-blue-500" />
          <span>Daily Expenses</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Employee Advances */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-1">
              <FaUserFriends className="text-blue-500" />
              <span>Employee Advances</span>
            </h3>
            <div className="space-y-3">
              {Object.keys(data.employeeAdvances).map((employee, index) => (
                <div key={employee} className="grid grid-cols-[1fr_2fr] items-center gap-3">
                  <Label htmlFor={employee} className="text-sm">
                    Employee {index + 1}
                  </Label>
                  <Input
                    id={employee}
                    type="number"
                    min="0"
                    value={data.employeeAdvances[employee as keyof SalesRecord['employeeAdvances']] || ''}
                    onChange={(e) => 
                      handleEmployeeChange(
                        employee as keyof SalesRecord['employeeAdvances'], 
                        e.target.value
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Cleaning Expenses */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-1">
              <FaBroom className="text-blue-500" />
              <span>Cleaning Expenses</span>
            </h3>
            <div className="grid grid-cols-[1fr_2fr] items-center gap-3">
              <Label htmlFor="cleaningExpenses" className="text-sm">
                Amount
              </Label>
              <Input
                id="cleaningExpenses"
                type="number"
                min="0"
                value={data.cleaningExpenses || ''}
                onChange={(e) => handleCleaningChange(e.target.value)}
              />
            </div>
          </div>

          {/* Other Expenses */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-1">
              <FaReceipt className="text-blue-500" />
              <span>Other Expenses</span>
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-[1fr_1fr] gap-3">
                <div>
                  <Label htmlFor="expenseName1" className="text-sm block mb-1">
                    Description 1
                  </Label>
                  <Input
                    id="expenseName1"
                    type="text"
                    value={data.otherExpenses.name1 || ''}
                    onChange={(e) => handleOtherExpenseChange('name1', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="expenseAmount1" className="text-sm block mb-1">
                    Amount 1
                  </Label>
                  <Input
                    id="expenseAmount1"
                    type="number"
                    min="0"
                    value={data.otherExpenses.amount1 || ''}
                    onChange={(e) => handleOtherExpenseChange('amount1', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-[1fr_1fr] gap-3">
                <div>
                  <Label htmlFor="expenseName2" className="text-sm block mb-1">
                    Description 2
                  </Label>
                  <Input
                    id="expenseName2"
                    type="text"
                    value={data.otherExpenses.name2 || ''}
                    onChange={(e) => handleOtherExpenseChange('name2', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="expenseAmount2" className="text-sm block mb-1">
                    Amount 2
                  </Label>
                  <Input
                    id="expenseAmount2"
                    type="number"
                    min="0"
                    value={data.otherExpenses.amount2 || ''}
                    onChange={(e) => handleOtherExpenseChange('amount2', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t mt-4 flex justify-between items-center">
            <span className="font-medium">Total Expenses:</span>
            <span className="text-xl font-bold text-blue-600 flex items-center">
              <FaReceipt className="mr-2" />
              ₹{totalExpenses.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpensesForm;
