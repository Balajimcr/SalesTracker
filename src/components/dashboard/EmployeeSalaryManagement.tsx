
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format, parse, addMonths, subMonths } from "date-fns";
import { toast } from "@/components/ui/sonner";
import { FaMoneyBillWave, FaRegCalendarAlt, FaUser, FaPiggyBank, FaFileInvoiceDollar } from "react-icons/fa";
import { Employee } from "./EmployeeManagement";

// Sample data structures
interface SalaryAdvance {
  id: string;
  date: string;
  amount: number;
  employeeId: string;
  comments: string;
  type: 'bank' | 'cash';
}

interface EmployeeSalary {
  id: string;
  month: string;
  employeeId: string;
  salary: number;
  totalSales: number;
  monthlyBankTransfers: number;
  monthlyCashWithdrawn: number;
  totalSalaryAdvance: number;
  balanceCurrent: number;
  balanceTillDate: number;
}

// Helper function to get current month in YYYY-MM format
const getCurrentMonth = () => {
  return format(new Date(), "yyyy-MM");
};

// Helper function to format month for display
const formatMonthForDisplay = (monthStr: string) => {
  const date = parse(monthStr, "yyyy-MM", new Date());
  return format(date, "MMMM yyyy");
};

// Generate last 12 months for dropdown
const generateLastTwelveMonths = () => {
  const result = [];
  let currentDate = new Date();
  
  for (let i = 0; i < 12; i++) {
    result.push(format(currentDate, "yyyy-MM"));
    currentDate = subMonths(currentDate, 1);
  }
  
  return result;
};

const EmployeeSalaryManagement = () => {
  // State for advances/transfers
  const [advanceDate, setAdvanceDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [advanceAmount, setAdvanceAmount] = useState<number | string>("");
  const [advanceEmployee, setAdvanceEmployee] = useState("");
  const [advanceComments, setAdvanceComments] = useState("");
  const [advanceType, setAdvanceType] = useState<'bank' | 'cash'>('bank');
  const [advances, setAdvances] = useState<SalaryAdvance[]>([]);
  
  // State for employees
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  
  // State for salary management
  const [salaries, setSalaries] = useState<EmployeeSalary[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [employeeSalaries, setEmployeeSalaries] = useState<Record<string, number>>({});
  
  // Months for selection
  const months = generateLastTwelveMonths();
  
  // Load employees on component mount
  useEffect(() => {
    loadEmployees();
    loadAdvances();
    loadSalaries();
  }, []);
  
  // Load employees from localStorage
  const loadEmployees = () => {
    const storedEmployees = localStorage.getItem('employees');
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    }
  };
  
  // Load advances from localStorage
  const loadAdvances = () => {
    const storedAdvances = localStorage.getItem('employeeSalaryAdvances');
    if (storedAdvances) {
      setAdvances(JSON.parse(storedAdvances));
    }
  };
  
  // Load salaries from localStorage
  const loadSalaries = () => {
    const storedSalaries = localStorage.getItem('employeeSalaryData');
    if (storedSalaries) {
      const parsedSalaries = JSON.parse(storedSalaries);
      setSalaries(parsedSalaries);
      
      // Initialize salary inputs for the selected month
      const currentMonthSalaries: Record<string, number> = {};
      parsedSalaries.forEach((salary: EmployeeSalary) => {
        if (salary.month === selectedMonth) {
          currentMonthSalaries[salary.employeeId] = salary.salary;
        }
      });
      setEmployeeSalaries(currentMonthSalaries);
    }
  };
  
  // Handle saving a new advance/transfer
  const handleSaveAdvance = () => {
    if (!advanceDate || !advanceAmount || !advanceEmployee) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const amountValue = typeof advanceAmount === 'string' ? parseFloat(advanceAmount) : advanceAmount;
    
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    const newAdvance: SalaryAdvance = {
      id: Date.now().toString(),
      date: advanceDate,
      amount: amountValue,
      employeeId: advanceEmployee,
      comments: advanceComments,
      type: advanceType
    };
    
    const updatedAdvances = [...advances, newAdvance];
    setAdvances(updatedAdvances);
    localStorage.setItem('employeeSalaryAdvances', JSON.stringify(updatedAdvances));
    
    // Reset form
    setAdvanceAmount("");
    setAdvanceComments("");
    
    toast.success("Salary advance/transfer saved successfully");
  };
  
  // Handle updating employee salary for the month
  const handleUpdateSalary = () => {
    if (Object.keys(employeeSalaries).length === 0) {
      toast.error("No salary data to update");
      return;
    }
    
    // Create updated salary records
    const updatedSalaries = [...salaries.filter(s => s.month !== selectedMonth)];
    
    for (const [employeeId, salary] of Object.entries(employeeSalaries)) {
      if (!salary) continue;
      
      // Calculate total advances for this employee in this month
      const employeeAdvances = advances.filter(a => 
        a.employeeId === employeeId && 
        a.date.substring(0, 7) === selectedMonth
      );
      
      const bankTransfers = employeeAdvances
        .filter(a => a.type === 'bank')
        .reduce((sum, advance) => sum + advance.amount, 0);
      
      const cashWithdrawn = employeeAdvances
        .filter(a => a.type === 'cash')
        .reduce((sum, advance) => sum + advance.amount, 0);
      
      const totalAdvance = bankTransfers + cashWithdrawn;
      
      // Calculate sales (45% of salary)
      const totalSales = Math.round(salary / 0.45);
      
      // Calculate current month balance
      const balanceCurrent = totalAdvance - salary;
      
      // Calculate balance till date (including previous months)
      let balanceTillDate = balanceCurrent;
      
      // Find the most recent balance before this month
      const prevMonths = salaries.filter(s => 
        s.employeeId === employeeId && s.month < selectedMonth
      ).sort((a, b) => b.month.localeCompare(a.month));
      
      if (prevMonths.length > 0) {
        balanceTillDate += prevMonths[0].balanceTillDate;
      }
      
      updatedSalaries.push({
        id: `${selectedMonth}-${employeeId}`,
        month: selectedMonth,
        employeeId,
        salary,
        totalSales,
        monthlyBankTransfers: bankTransfers,
        monthlyCashWithdrawn: cashWithdrawn,
        totalSalaryAdvance: totalAdvance,
        balanceCurrent,
        balanceTillDate
      });
    }
    
    // Sort by month and employee
    updatedSalaries.sort((a, b) => {
      const monthCompare = a.month.localeCompare(b.month);
      if (monthCompare !== 0) return monthCompare;
      return a.employeeId.localeCompare(b.employeeId);
    });
    
    setSalaries(updatedSalaries);
    localStorage.setItem('employeeSalaryData', JSON.stringify(updatedSalaries));
    
    toast.success("Salary data updated successfully");
  };
  
  // Handle salary input change for an employee
  const handleSalaryChange = (employeeId: string, value: string) => {
    const amount = value ? parseFloat(value) : 0;
    
    setEmployeeSalaries(prev => ({
      ...prev,
      [employeeId]: amount
    }));
  };
  
  // Handle month selection change
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    
    // Update salary inputs for the selected month
    const monthSalaries: Record<string, number> = {};
    salaries.forEach(salary => {
      if (salary.month === month) {
        monthSalaries[salary.employeeId] = salary.salary;
      }
    });
    
    setEmployeeSalaries(monthSalaries);
  };
  
  // Filter advances by the selected employee (if any)
  const filteredAdvances = selectedEmployee 
    ? advances.filter(a => a.employeeId === selectedEmployee)
    : advances;
  
  // Sort advances by date in descending order
  const sortedAdvances = [...filteredAdvances].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Filter salaries by the selected employee (if any)
  const filteredSalaries = selectedEmployee 
    ? salaries.filter(s => s.employeeId === selectedEmployee)
    : salaries;
  
  // Sort salaries by month in descending order
  const sortedSalaries = [...filteredSalaries].sort((a, b) => 
    b.month.localeCompare(a.month)
  );
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FaMoneyBillWave className="text-violet-500" />
            <span>Employee Salary Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="advances" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="advances" className="flex items-center gap-2">
                <FaPiggyBank />
                <span>Advances & Transfers</span>
              </TabsTrigger>
              <TabsTrigger value="salaries" className="flex items-center gap-2">
                <FaFileInvoiceDollar />
                <span>Salary Management</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FaUser />
                <span>Employee Reports</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Advances & Transfers Tab */}
            <TabsContent value="advances">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Record Advance/Transfer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="advanceDate">Date</Label>
                          <div className="flex items-center">
                            <FaRegCalendarAlt className="mr-2 text-gray-400" />
                            <Input
                              id="advanceDate"
                              type="date"
                              value={advanceDate}
                              onChange={(e) => setAdvanceDate(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="advanceAmount">Amount</Label>
                          <Input
                            id="advanceAmount"
                            type="number"
                            placeholder="Enter amount"
                            value={advanceAmount}
                            onChange={(e) => setAdvanceAmount(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="advanceEmployee">Employee</Label>
                        <Select 
                          value={advanceEmployee} 
                          onValueChange={setAdvanceEmployee}
                        >
                          <SelectTrigger id="advanceEmployee">
                            <SelectValue placeholder="Select an employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map((employee) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                {employee.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <div className="flex space-x-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="typeBank"
                              name="advanceType"
                              value="bank"
                              checked={advanceType === 'bank'}
                              onChange={() => setAdvanceType('bank')}
                              className="h-4 w-4 text-violet-600 focus:ring-violet-500"
                            />
                            <label htmlFor="typeBank">Bank Transfer</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="typeCash"
                              name="advanceType"
                              value="cash"
                              checked={advanceType === 'cash'}
                              onChange={() => setAdvanceType('cash')}
                              className="h-4 w-4 text-violet-600 focus:ring-violet-500"
                            />
                            <label htmlFor="typeCash">Cash Advance</label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="advanceComments">Comments</Label>
                        <Textarea
                          id="advanceComments"
                          placeholder="Optional comments"
                          value={advanceComments}
                          onChange={(e) => setAdvanceComments(e.target.value)}
                          rows={2}
                        />
                      </div>
                      
                      <Button 
                        className="w-full bg-violet-600 hover:bg-violet-700" 
                        onClick={handleSaveAdvance}
                      >
                        Save Entry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Filter by Employee</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Select 
                        value={selectedEmployee} 
                        onValueChange={setSelectedEmployee}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Employees" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Employees</SelectItem>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {selectedEmployee && (
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedEmployee("")}
                          className="w-full"
                        >
                          Clear Filter
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Advance & Transfer History</CardTitle>
                </CardHeader>
                <CardContent>
                  {sortedAdvances.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Employee</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Comments</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedAdvances.map((advance) => {
                            const employee = employees.find(e => e.id === advance.employeeId);
                            return (
                              <TableRow key={advance.id}>
                                <TableCell>
                                  {format(new Date(advance.date), "MMM d, yyyy")}
                                </TableCell>
                                <TableCell>
                                  {employee?.name || "Unknown Employee"}
                                </TableCell>
                                <TableCell>
                                  {advance.type === 'bank' ? 'Bank Transfer' : 'Cash Advance'}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  ₹{advance.amount.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  {advance.comments || "—"}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FaMoneyBillWave className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No salary advances or transfers recorded yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Salary Management Tab */}
            <TabsContent value="salaries">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Salary Update</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="salaryMonth">Select Month</Label>
                      <Select 
                        value={selectedMonth} 
                        onValueChange={handleMonthChange}
                      >
                        <SelectTrigger id="salaryMonth">
                          <SelectValue placeholder="Select a month" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month} value={month}>
                              {formatMonthForDisplay(month)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {employees.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid gap-4">
                          {employees.map((employee) => (
                            <div key={employee.id} className="grid grid-cols-2 gap-4 p-4 border rounded-md">
                              <div className="font-medium">{employee.name}</div>
                              <div>
                                <Input
                                  type="number"
                                  placeholder="Enter salary"
                                  value={employeeSalaries[employee.id] || ""}
                                  onChange={(e) => handleSalaryChange(employee.id, e.target.value)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <Button 
                          className="w-full bg-violet-600 hover:bg-violet-700" 
                          onClick={handleUpdateSalary}
                        >
                          Update Salaries
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No employees found. Please add employees first.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Salary Records</CardTitle>
                </CardHeader>
                <CardContent>
                  {sortedSalaries.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Month</TableHead>
                            <TableHead>Employee</TableHead>
                            <TableHead className="text-right">Salary</TableHead>
                            <TableHead className="text-right">Bank Transfers</TableHead>
                            <TableHead className="text-right">Cash Advances</TableHead>
                            <TableHead className="text-right">Total Advance</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                            <TableHead className="text-right">Running Balance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedSalaries.map((salary) => {
                            const employee = employees.find(e => e.id === salary.employeeId);
                            return (
                              <TableRow key={salary.id}>
                                <TableCell>
                                  {formatMonthForDisplay(salary.month)}
                                </TableCell>
                                <TableCell>
                                  {employee?.name || "Unknown Employee"}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  ₹{salary.salary.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  ₹{salary.monthlyBankTransfers.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  ₹{salary.monthlyCashWithdrawn.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  ₹{salary.totalSalaryAdvance.toLocaleString()}
                                </TableCell>
                                <TableCell className={`text-right ${salary.balanceCurrent < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  ₹{salary.balanceCurrent.toLocaleString()}
                                </TableCell>
                                <TableCell className={`text-right font-medium ${salary.balanceTillDate < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  ₹{salary.balanceTillDate.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FaFileInvoiceDollar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No salary records found.</p>
                      <p className="mt-2">Update employee salaries to get started.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Employee Reports Tab */}
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Employee Financial Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Select Employee</Label>
                      <Select 
                        value={selectedEmployee} 
                        onValueChange={setSelectedEmployee}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedEmployee ? (
                      <div className="space-y-6">
                        {sortedSalaries.length > 0 ? (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Card>
                                <CardContent className="pt-6">
                                  <div className="text-2xl font-bold text-center text-violet-600">
                                    {(() => {
                                      const latestSalary = sortedSalaries[0];
                                      return latestSalary ? `₹${latestSalary.salary.toLocaleString()}` : '₹0';
                                    })()}
                                  </div>
                                  <p className="text-center text-sm text-gray-500 mt-2">Current Monthly Salary</p>
                                </CardContent>
                              </Card>
                              
                              <Card>
                                <CardContent className="pt-6">
                                  <div className="text-2xl font-bold text-center text-violet-600">
                                    {(() => {
                                      const latest = sortedSalaries[0];
                                      return latest ? `₹${latest.totalSalaryAdvance.toLocaleString()}` : '₹0';
                                    })()}
                                  </div>
                                  <p className="text-center text-sm text-gray-500 mt-2">Latest Monthly Advance</p>
                                </CardContent>
                              </Card>
                              
                              <Card>
                                <CardContent className="pt-6">
                                  <div className={`text-2xl font-bold text-center ${
                                    sortedSalaries[0]?.balanceTillDate < 0 ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    {(() => {
                                      const latest = sortedSalaries[0];
                                      return latest ? `₹${latest.balanceTillDate.toLocaleString()}` : '₹0';
                                    })()}
                                  </div>
                                  <p className="text-center text-sm text-gray-500 mt-2">Current Running Balance</p>
                                </CardContent>
                              </Card>
                            </div>
                            
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Month</TableHead>
                                    <TableHead className="text-right">Salary</TableHead>
                                    <TableHead className="text-right">Bank Transfers</TableHead>
                                    <TableHead className="text-right">Cash Advances</TableHead>
                                    <TableHead className="text-right">Total Advance</TableHead>
                                    <TableHead className="text-right">Monthly Balance</TableHead>
                                    <TableHead className="text-right">Running Balance</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {sortedSalaries.map((salary) => (
                                    <TableRow key={salary.id}>
                                      <TableCell>
                                        {formatMonthForDisplay(salary.month)}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        ₹{salary.salary.toLocaleString()}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        ₹{salary.monthlyBankTransfers.toLocaleString()}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        ₹{salary.monthlyCashWithdrawn.toLocaleString()}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        ₹{salary.totalSalaryAdvance.toLocaleString()}
                                      </TableCell>
                                      <TableCell className={`text-right ${salary.balanceCurrent < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        ₹{salary.balanceCurrent.toLocaleString()}
                                      </TableCell>
                                      <TableCell className={`text-right font-medium ${salary.balanceTillDate < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        ₹{salary.balanceTillDate.toLocaleString()}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                            
                            <div className="space-y-4">
                              <h3 className="font-semibold">Recent Advances</h3>
                              {sortedAdvances.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead>Comments</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {sortedAdvances.slice(0, 5).map((advance) => (
                                        <TableRow key={advance.id}>
                                          <TableCell>
                                            {format(new Date(advance.date), "MMM d, yyyy")}
                                          </TableCell>
                                          <TableCell>
                                            {advance.type === 'bank' ? 'Bank Transfer' : 'Cash Advance'}
                                          </TableCell>
                                          <TableCell className="text-right font-medium">
                                            ₹{advance.amount.toLocaleString()}
                                          </TableCell>
                                          <TableCell>
                                            {advance.comments || "—"}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              ) : (
                                <p className="text-gray-500 italic">No advances recorded for this employee.</p>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <p>No salary data found for this employee.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FaUser className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Please select an employee to view their financial report.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeSalaryManagement;
