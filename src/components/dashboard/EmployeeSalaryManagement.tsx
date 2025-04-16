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
import { FaMoneyBillWave, FaRegCalendarAlt, FaUser, FaPiggyBank, FaFileInvoiceDollar } from "react-icons/fa";

// Interfaces for our data structures
interface Employee {
  id: string;
  name: string;
}

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
  const [employees, setEmployees] = useState<Employee[]>([
    { id: '1', name: 'Employee 1' },
    { id: '2', name: 'Employee 2' },
    { id: '3', name: 'Employee 3' },
    { id: '4', name: 'Employee 4' }
  ]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  
  // State for salary management
  const [advances, setAdvances] = useState<SalaryAdvance[]>([]);
  const [salaries, setSalaries] = useState<EmployeeSalary[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [employeeSalaries, setEmployeeSalaries] = useState<Record<string, number>>({});
  
  // Generate last 12 months for dropdown
  const months = Array.from({ length: 12 }, (_, i) => 
    format(subMonths(new Date(), i), "yyyy-MM")
  ).reverse();
  
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
  
  // Load data from localStorage on component mount
  useEffect(() => {
    const storedAdvances = localStorage.getItem('employeeSalaryAdvances');
    const storedSalaries = localStorage.getItem('employeeSalaryData');
    
    if (storedAdvances) {
      setAdvances(JSON.parse(storedAdvances));
    }
    
    if (storedSalaries) {
      setSalaries(JSON.parse(storedSalaries));
    }
  }, []);
  
  // Filtering and sorting functions
  const filteredAdvances = selectedEmployee 
    ? advances.filter(a => a.employeeId === selectedEmployee)
    : advances;
  
  const filteredSalaries = selectedEmployee 
    ? salaries.filter(s => s.employeeId === selectedEmployee)
    : salaries;
  
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
                      >
                        Save Entry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Filter by Employee</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </div>
              
              {/* Advances Table */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Advance & Transfer History</CardTitle>
                </CardHeader>
                <CardContent>
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
                    
                    <Button 
                      className="w-full bg-violet-600 hover:bg-violet-700" 
                      onClick={handleUpdateSalary}
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
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Employee Reports Tab */}
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Employee Financial Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
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
                    
                    {selectedEmployee && (
                      <>
                        <Card>
                          <CardContent className="pt-6">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Month</TableHead>
                                  <TableHead className="text-right">Salary</TableHead>
                                  <TableHead className="text-right">Total Advance</TableHead>
                                  <TableHead className="text-right">Balance</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredSalaries.map((salary) => (
                                  <TableRow key={salary.id}>
                                    <TableCell>
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
                          </CardContent>
                        </Card>
                      </>
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
