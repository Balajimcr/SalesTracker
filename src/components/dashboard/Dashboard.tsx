
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalesEntryForm from "./SalesEntryForm";
import EmployeeManagement from "./EmployeeManagement";
import SalesDashboard from "./SalesDashboard";
import StoreManagement from "./StoreManagement";
import StoreSelector from "./StoreSelector";
import { FaShoppingBag, FaUsers, FaChartLine, FaMoneyBillWave, FaFileExport, FaStore } from "react-icons/fa";
import EmployeeSalaryManagement from "./EmployeeSalaryManagement";
import DataImportExport from "./DataImportExport";
import { initializeDefaultStore, getActiveStore } from "@/services/storeService";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [employeeActiveTab, setEmployeeActiveTab] = useState("management");
  const [activeStore, setActiveStoreState] = useState(getActiveStore());
  
  useEffect(() => {
    // Initialize default store if none exists
    initializeDefaultStore();
    setActiveStoreState(getActiveStore());
  }, []);
  
  useEffect(() => {
    const handleStorageChange = () => {
      setActiveStoreState(getActiveStore());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-shop-primary to-shop-secondary p-3 rounded-xl shadow-lg">
              <FaShoppingBag className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 bg-gradient-to-r from-shop-primary to-shop-accent bg-clip-text text-transparent">
                Daily Accounts
              </h1>
              <p className="text-sm md:text-base font-medium text-shop-secondary">
                {activeStore?.name || 'Smart Retail Analytics & Management'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-start md:justify-end gap-4">
            <StoreSelector />
            <div className="px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
              <span className="text-xs font-medium text-blue-700">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>
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
            <TabsTrigger value="stores" className="flex items-center gap-2">
              <FaStore />
              <span>Stores</span>
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
          
          <TabsContent value="stores">
            <StoreManagement />
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
