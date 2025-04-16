
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalesEntryForm from "./SalesEntryForm";
import EmployeeManagement from "./EmployeeManagement";
import SalesDashboard from "./SalesDashboard";
import { FaShoppingBag, FaUsers, FaChartLine, FaMoneyBillWave, FaFileExport } from "react-icons/fa";
import EmployeeSalaryManagement from "./EmployeeSalaryManagement";
import DataImportExport from "./DataImportExport";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [employeeActiveTab, setEmployeeActiveTab] = useState("management");
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FaShoppingBag className="text-3xl text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Shop Sales Insights</h1>
          </div>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
        <p className="text-gray-600 max-w-2xl">
          Track and manage your daily shop sales, expenses, and cash flow with this easy-to-use dashboard.
        </p>
      </header>

      <main>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <FaShoppingBag />
              <span>Sales Entry</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <FaChartLine />
              <span>Sales Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <FaUsers />
              <span>Employees</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <FaFileExport />
              <span>Import/Export</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sales">
            <SalesEntryForm />
          </TabsContent>
          
          <TabsContent value="dashboard">
            <SalesDashboard />
          </TabsContent>
          
          <TabsContent value="employees">
            <Tabs value={employeeActiveTab} onValueChange={setEmployeeActiveTab} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="management" className="flex items-center gap-2">
                  <FaUsers />
                  <span>Employee Management</span>
                </TabsTrigger>
                <TabsTrigger value="salary" className="flex items-center gap-2">
                  <FaMoneyBillWave />
                  <span>Salary Management</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="management">
                <EmployeeManagement />
              </TabsContent>
              
              <TabsContent value="salary">
                <EmployeeSalaryManagement />
              </TabsContent>
            </Tabs>
          </TabsContent>
          
          <TabsContent value="data">
            <DataImportExport />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
