
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { FaUserPlus, FaEdit, FaTrash, FaSave, FaTimes, FaUsers } from "react-icons/fa";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { csvStoreService } from "@/services/csvStoreService";
import { csvEmployeeService } from "@/services/csvEmployeeService";

export interface Employee {
  id: string;
  name: string;
  mobile: string;
  joiningDate: string;
}

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [activeStore, setActiveStoreState] = useState(csvStoreService.getActiveStore());
  const [newEmployee, setNewEmployee] = useState<Employee>({
    id: '',
    name: '',
    mobile: '',
    joiningDate: new Date().toISOString().split('T')[0]
  });
  
  // Load employees from CSV service on component mount
  useEffect(() => {
    const store = csvStoreService.getActiveStore();
    setActiveStoreState(store);
    if (store) {
      setEmployees(csvEmployeeService.getEmployeesForStore(store.id));
    }
  }, []);
  
  // Update employees when active store changes
  useEffect(() => {
    const handleStorageChange = () => {
      const store = csvStoreService.getActiveStore();
      setActiveStoreState(store);
      if (store) {
        setEmployees(csvEmployeeService.getEmployeesForStore(store.id));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const handleAddEmployee = () => {
    setIsAddingEmployee(true);
    setNewEmployee({
      id: Date.now().toString(),
      name: '',
      mobile: '',
      joiningDate: new Date().toISOString().split('T')[0]
    });
  };
  
  const handleSaveEmployee = () => {
    if (!newEmployee.name.trim()) {
      toast.error("Employee name is required!");
      return;
    }
    
    if (!activeStore) {
      toast.error("No active store selected!");
      return;
    }
    
    csvEmployeeService.saveEmployeeForStore(activeStore.id, newEmployee);
    setEmployees(csvEmployeeService.getEmployeesForStore(activeStore.id));
    
    if (editingEmployeeId) {
      toast.success("Employee updated successfully!");
      setEditingEmployeeId(null);
    } else {
      toast.success("Employee added successfully!");
    }
    
    setIsAddingEmployee(false);
  };
  
  const handleCancelAddEdit = () => {
    setIsAddingEmployee(false);
    setEditingEmployeeId(null);
  };
  
  const handleEditEmployee = (employee: Employee) => {
    setNewEmployee(employee);
    setEditingEmployeeId(employee.id);
    setIsAddingEmployee(true);
  };
  
  const handleDeleteEmployee = (id: string) => {
    if (!activeStore) {
      toast.error("No active store selected!");
      return;
    }
    
    csvEmployeeService.deleteEmployeeFromStore(activeStore.id, id);
    setEmployees(csvEmployeeService.getEmployeesForStore(activeStore.id));
    toast.success("Employee removed successfully!");
  };
  
  const handleSelectDate = (date: Date | undefined) => {
    if (date) {
      setNewEmployee(prev => ({
        ...prev,
        joiningDate: date.toISOString().split('T')[0]
      }));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FaUsers className="text-blue-500" />
            <span>Employee Management</span>
            {activeStore && (
              <span className="text-sm font-normal text-muted-foreground">
                ({activeStore.name})
              </span>
            )}
          </CardTitle>
          {!isAddingEmployee && (
            <Button onClick={handleAddEmployee} className="bg-blue-600 hover:bg-blue-700">
              <FaUserPlus className="mr-2" />
              Add Employee
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isAddingEmployee ? (
            <div className="space-y-4 p-4 border rounded-md bg-gray-50">
              <h3 className="text-lg font-medium">
                {editingEmployeeId ? "Edit Employee" : "Add New Employee"}
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="employeeName">Employee Name</Label>
                  <Input
                    id="employeeName"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter employee name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employeeMobile">Mobile Number</Label>
                  <Input
                    id="employeeMobile"
                    value={newEmployee.mobile}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, mobile: e.target.value }))}
                    placeholder="Enter mobile number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employeeJoiningDate">Joining Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newEmployee.joiningDate && "text-muted-foreground"
                        )}
                        id="employeeJoiningDate"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newEmployee.joiningDate ? (
                          format(new Date(newEmployee.joiningDate), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newEmployee.joiningDate ? new Date(newEmployee.joiningDate) : undefined}
                        onSelect={handleSelectDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={handleCancelAddEdit}>
                  <FaTimes className="mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveEmployee} className="bg-blue-600 hover:bg-blue-700">
                  <FaSave className="mr-2" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            employees.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile Number</TableHead>
                    <TableHead>Joining Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.mobile}</TableCell>
                      <TableCell>
                        {employee.joiningDate ? format(new Date(employee.joiningDate), "PPP") : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEmployee(employee)}
                          className="h-8 w-8 p-0 mr-2"
                        >
                          <span className="sr-only">Edit</span>
                          <FaEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                        >
                          <span className="sr-only">Delete</span>
                          <FaTrash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaUsers className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No employees added yet.</p>
                <p className="mt-2">Add your first employee to get started.</p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeManagement;
