
import React, { useState, useEffect } from 'react';
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
import { 
  FaMoneyBillWave, 
  FaRegCalendarAlt, 
  FaUser, 
  FaPiggyBank, 
  FaFileInvoiceDollar, 
  FaUserPlus, 
  FaUserMinus,
  FaFilter
} from "react-icons/fa";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Employee } from './EmployeeManagement';

// Interface for our data structures
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

const EmployeeSalaryManagement = () => {
  // State for advances/transfers
  const [advanceDate, setAdvanceDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [advanceAmount, setAdvanceAmount] = useState<number | string>("");
  const [advanceEmployee, setAdvanceEmployee] = useState("");
  const [advanceComments, setAdvanceComments] = useState("");
  const [advanceType, setAdvanceType] = useState<'bank' | 'cash'>('bank');
  
  // State for employees and salaries
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [newEmployeeMobile, setNewEmployeeMobile] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  
  // State for salary management
  const [advances, setAdvances] = useState<SalaryAdvance[]>([]);
  const [salaries, setSalaries] = useState<EmployeeSalary[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [employeeSalaries, setEmployeeSalaries] = useState<Record<string, number>>({});
  
  // New state for detailed employee reports
  const [reportFilterMonth, setReportFilterMonth] = useState<string>("all");
  
  // Generate last 12 months for dropdown
  const months = Array.from({ length: 12 }, (_, i) => 
    format(subMonths(new Date(), i), "yyyy-MM")
  ).reverse();
  
  // Load employees from localStorage on component mount
  useEffect(() => {
    const storedEmployees = localStorage.getItem('employees');
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    }
    
    const storedAdvances = localStorage.getItem('employeeSalaryAdvances');
    const storedSalaries = localStorage.getItem('employeeSalaryData');
    
    if (storedAdvances) {
      setAdvances(JSON.parse(storedAdvances));
    }
    
    if (storedSalaries) {
      setSalaries(JSON.parse(storedSalaries));
    }
  }, []);
  
  // Add new employee
  const handleAddEmployee = () => {
    if (!newEmployeeName.trim()) {
      toast.error("Employee name is required!");
      return;
    }
    
    const newEmployee: Employee = {
      id: Date.now().toString(),
      name: newEmployeeName,
      mobile: newEmployeeMobile,
      joiningDate: new Date().toISOString().split('T')[0]
    };
    
    const updatedEmployees = [...employees, newEmployee];
    setEmployees(updatedEmployees);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    
    setNewEmployeeName("");
    setNewEmployeeMobile("");
    setIsAddEmployeeDialogOpen(false);
    toast.success("Employee added successfully!");
  };
  
  // Remove employee
  const handleRemoveEmployee = (employeeId: string) => {
    // First check if employee has advances or salaries
    const hasAdvances = advances.some(a => a.employeeId === employeeId);
    const hasSalaries = salaries.some(s => s.employeeId === employeeId);
    
    if (hasAdvances || hasSalaries) {
      toast.error("Cannot remove employee with existing salary records or advances");
      return;
    }
    
    const updatedEmployees = employees.filter(e => e.id !== employeeId);
    setEmployees(updatedEmployees);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    
    if (selectedEmployee === employeeId) {
      setSelectedEmployee("");
    }
    
    toast.success("Employee removed successfully!");
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
  
  // Handle updating employee salary
  const handleUpdateSalary = () => {
    const updatedSalaries: EmployeeSalary[] = employees.map(employee => {
      const salary = employeeSalaries[employee.id] || 0;
      
      // Calculate advances for this employee in this month
      const employeeAdvances = advances.filter(a => 
        a.employeeId === employee.id && 
        a.date.substring(0, 7) === selectedMonth
      );
      
      const bankTransfers = employeeAdvances
        .filter(a => a.type === 'bank')
        .reduce((sum, advance) => sum + advance.amount, 0);
      
      const cashWithdrawn = employeeAdvances
        .filter(a => a.type === 'cash')
        .reduce((sum, advance) => sum + advance.amount, 0);
      
      const totalAdvance = bankTransfers + cashWithdrawn;
      const totalSales = Math.round(salary / 0.45);
      const balanceCurrent = totalAdvance - salary;
      
      return {
        id: `${selectedMonth}-${employee.id}`,
        month: selectedMonth,
        employeeId: employee.id,
        salary,
        totalSales,
        monthlyBankTransfers: bankTransfers,
        monthlyCashWithdrawn: cashWithdrawn,
        totalSalaryAdvance: totalAdvance,
        balanceCurrent,
        balanceTillDate: balanceCurrent  // Simple implementation, could be more complex
      };
    });
    
    setSalaries(updatedSalaries);
    localStorage.setItem('employeeSalaryData', JSON.stringify(updatedSalaries));
    
    toast.success("Salary data updated successfully");
  };
  
  // Filtering and sorting functions
  const filteredAdvances = selectedEmployee 
    ? advances.filter(a => a.employeeId === selectedEmployee)
    : advances;
  
  const filteredSalaries = selectedEmployee 
    ? salaries.filter(s => s.employeeId === selectedEmployee)
    : salaries;
  
  // Filter detailed report data
  const getFilteredReportData = () => {
    if (!selectedEmployee) return [];
    
    let filteredAdvances = advances.filter(a => a.employeeId === selectedEmployee);
    
    // Apply month filter if not set to "all"
    if (reportFilterMonth !== "all") {
      filteredAdvances = filteredAdvances.filter(a => a.date.substring(0, 7) === reportFilterMonth);
    }
    
    // Sort by date (newest first)
    return filteredAdvances.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };
  
  // Calculate financial summary
  const getFinancialSummary = () => {
    if (!selectedEmployee) return { totalSalary: 0, totalBank: 0, totalCash: 0, netBalance: 0 };
    
    const employeeSalaryData = salaries.filter(s => s.employeeId === selectedEmployee);
    
    let filteredSalaryData = employeeSalaryData;
    
    // Apply month filter if not set to "all"
    if (reportFilterMonth !== "all") {
      filteredSalaryData = employeeSalaryData.filter(s => s.month === reportFilterMonth);
    }
    
    const totalSalary = filteredSalaryData.reduce((sum, s) => sum + s.salary, 0);
    const totalBank = filteredSalaryData.reduce((sum, s) => sum + s.monthlyBankTransfers, 0);
    const totalCash = filteredSalaryData.reduce((sum, s) => sum + s.monthlyCashWithdrawn, 0);
    const netBalance = (totalBank + totalCash) - totalSalary;
    
    return { totalSalary, totalBank, totalCash, netBalance };
  };
  
  // When employees are updated, update the dropdown selection if needed
  useEffect(() => {
    if (selectedEmployee && !employees.some(e => e.id === selectedEmployee)) {
      setSelectedEmployee("");
    }
  }, [employees, selectedEmployee]);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaMoneyBillWave className="text-violet-500" />
              <span>Employee Salary Management</span>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={isAddEmployeeDialogOpen} onOpenChange={setIsAddEmployeeDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <FaUserPlus className="mr-2" />
                    Add Employee
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Employee Name</Label>
                      <Input
                        id="name"
                        value={newEmployeeName}
                        onChange={(e) => setNewEmployeeName(e.target.value)}
                        placeholder="Enter employee name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile Number</Label>
                      <Input
                        id="mobile"
                        value={newEmployeeMobile}
                        onChange={(e) => setNewEmployeeMobile(e.target.value)}
                        placeholder="Enter mobile number"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddEmployee} className="bg-green-600 hover:bg-green-700">
                      Save Employee
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Record Advance/Transfer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Date</Label>
                          <Input
                            type="date"
                            value={advanceDate}
                            onChange={(e) => setAdvanceDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Amount</Label>
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            value={advanceAmount}
                            onChange={(e) => setAdvanceAmount(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Employee</Label>
                        {employees.length > 0 ? (
                          <Select 
                            value={advanceEmployee} 
                            onValueChange={setAdvanceEmployee}
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
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            No employees available. Please add employees first.
                          </div>
                        )}
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
                            />
                            <label htmlFor="typeCash">Cash Advance</label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Comments</Label>
                        <Textarea
                          placeholder="Optional comments"
                          value={advanceComments}
                          onChange={(e) => setAdvanceComments(e.target.value)}
                          rows={2}
                        />
                      </div>
                      
                      <Button 
                        className="w-full bg-violet-600 hover:bg-violet-700" 
                        onClick={handleSaveAdvance}
                        disabled={employees.length === 0}
                      >
                        Save Entry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Employees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Filter by Employee</Label>
                        <Select 
                          value={selectedEmployee} 
                          onValueChange={setSelectedEmployee}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All Employees" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all-employees">All Employees</SelectItem>
                            {employees.map((employee) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                {employee.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2 border rounded-md p-4">
                        <h3 className="font-medium mb-2">Employee List</h3>
                        {employees.length > 0 ? (
                          <ul className="space-y-2">
                            {employees.map((employee) => (
                              <li key={employee.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md">
                                <span>{employee.name}</span>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleRemoveEmployee(employee.id)}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <FaUserMinus className="h-4 w-4" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">No employees added yet</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Advances Table */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Advance & Transfer History</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredAdvances.length > 0 ? (
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
                        {filteredAdvances.map((advance) => {
                          const employee = employees.find(e => e.id === advance.employeeId);
                          return (
                            <TableRow key={advance.id}>
                              <TableCell>{advance.date}</TableCell>
                              <TableCell>{employee?.name || "Unknown"}</TableCell>
                              <TableCell>{advance.type === 'bank' ? 'Bank' : 'Cash'}</TableCell>
                              <TableCell className="text-right">₹{advance.amount.toLocaleString()}</TableCell>
                              <TableCell>{advance.comments || "—"}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No advance records found.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Salary Management Tab */}
            <TabsContent value="salaries">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Salary Update</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Month</Label>
                      <Select 
                        value={selectedMonth} 
                        onValueChange={setSelectedMonth}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a month" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month} value={month}>
                              {format(parse(month, "yyyy-MM", new Date()), "MMMM yyyy")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {employees.length > 0 ? (
                      <div className="grid gap-4">
                        {employees.map((employee) => (
                          <div key={employee.id} className="grid grid-cols-2 gap-4 p-4 border rounded-md">
                            <div className="font-medium">{employee.name}</div>
                            <div>
                              <Input
                                type="number"
                                placeholder="Enter salary"
                                value={employeeSalaries[employee.id] || ""}
                                onChange={(e) => {
                                  const value = e.target.value ? parseFloat(e.target.value) : 0;
                                  setEmployeeSalaries(prev => ({
                                    ...prev,
                                    [employee.id]: value
                                  }));
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No employees available. Please add employees first.</p>
                      </div>
                    )}
                    
                    <Button 
                      className="w-full bg-violet-600 hover:bg-violet-700" 
                      onClick={handleUpdateSalary}
                      disabled={employees.length === 0}
                    >
                      Update Salaries
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Salary Records Table */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Monthly Salary Records</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredSalaries.length > 0 ? (
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSalaries.map((salary) => {
                          const employee = employees.find(e => e.id === salary.employeeId);
                          return (
                            <TableRow key={salary.id}>
                              <TableCell>{format(parse(salary.month, "yyyy-MM", new Date()), "MMMM yyyy")}</TableCell>
                              <TableCell>{employee?.name || "Unknown"}</TableCell>
                              <TableCell className="text-right">₹{salary.salary.toLocaleString()}</TableCell>
                              <TableCell className="text-right">₹{salary.monthlyBankTransfers.toLocaleString()}</TableCell>
                              <TableCell className="text-right">₹{salary.monthlyCashWithdrawn.toLocaleString()}</TableCell>
                              <TableCell className="text-right">₹{salary.totalSalaryAdvance.toLocaleString()}</TableCell>
                              <TableCell className={`text-right ${salary.balanceCurrent < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                ₹{salary.balanceCurrent.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No salary records found.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Employee Reports Tab - Enhanced with detailed information */}
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Employee Financial Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      
                      <div className="space-y-2">
                        <Label>Filter by Month</Label>
                        <Select 
                          value={reportFilterMonth} 
                          onValueChange={setReportFilterMonth}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All Months" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Months</SelectItem>
                            {months.map((month) => (
                              <SelectItem key={month} value={month}>
                                {format(parse(month, "yyyy-MM", new Date()), "MMMM yyyy")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {selectedEmployee ? (
                      <>
                        {/* Financial Summary Card */}
                        <Card className="bg-gray-50 border">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Financial Summary</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-white p-4 rounded-md shadow-sm border">
                                <div className="text-sm text-gray-500">Total Salary</div>
                                <div className="text-xl font-bold mt-1">
                                  ₹{getFinancialSummary().totalSalary.toLocaleString()}
                                </div>
                              </div>
                              <div className="bg-white p-4 rounded-md shadow-sm border">
                                <div className="text-sm text-gray-500">Bank Transfers</div>
                                <div className="text-xl font-bold mt-1">
                                  ₹{getFinancialSummary().totalBank.toLocaleString()}
                                </div>
                              </div>
                              <div className="bg-white p-4 rounded-md shadow-sm border">
                                <div className="text-sm text-gray-500">Cash Advances</div>
                                <div className="text-xl font-bold mt-1">
                                  ₹{getFinancialSummary().totalCash.toLocaleString()}
                                </div>
                              </div>
                              <div className="bg-white p-4 rounded-md shadow-sm border">
                                <div className="text-sm text-gray-500">Net Balance</div>
                                <div className={`text-xl font-bold mt-1 ${
                                  getFinancialSummary().netBalance < 0 ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  ₹{getFinancialSummary().netBalance.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Detailed Transaction History */}
                        <div>
                          <h3 className="text-lg font-medium mb-4 flex items-center">
                            <FaFilter className="mr-2 text-gray-500" />
                            Detailed Transaction History
                            {reportFilterMonth !== "all" && (
                              <span className="ml-2 text-sm font-normal text-gray-500">
                                ({format(parse(reportFilterMonth, "yyyy-MM", new Date()), "MMMM yyyy")})
                              </span>
                            )}
                          </h3>
                          
                          {getFilteredReportData().length > 0 ? (
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
                                {getFilteredReportData().map((transaction) => (
                                  <TableRow key={transaction.id}>
                                    <TableCell>{format(new Date(transaction.date), "dd MMM yyyy")}</TableCell>
                                    <TableCell>
                                      <span className={`px-2 py-1 rounded-full text-xs ${
                                        transaction.type === 'bank' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                      }`}>
                                        {transaction.type === 'bank' ? 'Bank Transfer' : 'Cash Advance'}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                      ₹{transaction.amount.toLocaleString()}
                                    </TableCell>
                                    <TableCell>{transaction.comments || "—"}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md border">
                              <p>No transaction records found for this employee.</p>
                              {reportFilterMonth !== "all" && (
                                <p className="mt-2 text-sm">Try selecting a different month or "All Months".</p>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Monthly Performance Chart - Simple table format */}
                        <div className="mt-6">
                          <h3 className="text-lg font-medium mb-4">Monthly Performance</h3>
                          {filteredSalaries.length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Month</TableHead>
                                  <TableHead className="text-right">Salary</TableHead>
                                  <TableHead className="text-right">Total Advances</TableHead>
                                  <TableHead className="text-right">Balance</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredSalaries
                                  .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime())
                                  .map((salary) => (
                                    <TableRow key={salary.id}>
                                      <TableCell className="font-medium">
                                        {format(parse(salary.month, "yyyy-MM", new Date()), "MMMM yyyy")}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        ₹{salary.salary.toLocaleString()}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        ₹{salary.totalSalaryAdvance.toLocaleString()}
                                      </TableCell>
                                      <TableCell className={`text-right ${salary.balanceCurrent < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        ₹{salary.balanceCurrent.toLocaleString()}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md border">
                              <p>No salary records found for this employee.</p>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md border">
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
