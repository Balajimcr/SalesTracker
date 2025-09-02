
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalesEntryForm from "./SalesEntryForm";
import EmployeeManagement from "./EmployeeManagement";
import SalesDashboard from "./SalesDashboard";
import StoreManagement from "./StoreManagement";
import { FaShoppingBag, FaUsers, FaChartLine, FaMoneyBillWave, FaFileExport, FaStore, FaCog } from "react-icons/fa";
import EmployeeSalaryManagement from "./EmployeeSalaryManagement";
import DataImportExport from "./DataImportExport";
import { csvStoreService } from "@/services/csvStoreService";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [employeeActiveTab, setEmployeeActiveTab] = useState("management");
  const [activeStore, setActiveStoreState] = useState(csvStoreService.getActiveStore());
  const [activeStoreTab, setActiveStoreTab] = useState("");
  const [allStores] = useState(csvStoreService.getAllStores());
  
  useEffect(() => {
    // Initialize default store if none exists
    csvStoreService.initializeDefaultStore();
    const currentStore = csvStoreService.getActiveStore();
    setActiveStoreState(currentStore);
    if (currentStore) {
      setActiveStoreTab(currentStore.id);
    }
  }, []);
  
  useEffect(() => {
    const handleStorageChange = () => {
      const currentStore = csvStoreService.getActiveStore();
      setActiveStoreState(currentStore);
      if (currentStore) {
        setActiveStoreTab(currentStore.id);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleStoreTabChange = (storeId: string) => {
    csvStoreService.setActiveStore(storeId);
    setActiveStoreTab(storeId);
    setActiveStoreState(csvStoreService.getActiveStore());
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-primary to-secondary p-3 rounded-xl shadow-lg">
              <FaShoppingBag className="text-3xl text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Daily Accounts
              </h1>
            </div>
          </div>
          <div className="flex items-center justify-start md:justify-end gap-4 md:mr-4">
            <div className="px-3 py-1.5 bg-muted rounded-lg border">
              <span className="text-xs font-medium text-muted-foreground">
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
        
        {/* Store Selection */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <FaStore className="text-primary h-5 w-5" />
            <h3 className="font-semibold text-foreground">Store</h3>
          </div>
          {allStores.length > 1 ? (
            <Tabs value={activeStoreTab} onValueChange={handleStoreTabChange} className="w-full">
              <TabsList className="bg-muted border shadow-sm">
                {allStores.map(store => (
                  <TabsTrigger 
                    key={store.id} 
                    value={store.id}
                    className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <span className="font-medium">{store.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          ) : activeStore ? (
            <div className="px-4 py-2 bg-muted border rounded-md">
              <span className="font-medium text-foreground">{activeStore.name}</span>
            </div>
          ) : null}
        </div>
      </header>

      <main>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-muted">
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <FaShoppingBag />
              <span>Sales Entry</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <FaChartLine />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <FaUsers />
              <span>Employee Accounts</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <FaCog />
              <span>Admin Panel</span>
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
              <TabsList className="mb-6 bg-muted">
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
          
          <TabsContent value="admin">
            <Tabs defaultValue="stores" className="w-full">
              <TabsList className="mb-6 bg-muted">
                <TabsTrigger value="stores" className="flex items-center gap-2">
                  <FaStore />
                  <span>Store Management</span>
                </TabsTrigger>
                <TabsTrigger value="import-export" className="flex items-center gap-2">
                  <FaFileExport />
                  <span>Import/Export</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="stores">
                <StoreManagement />
              </TabsContent>
              
              <TabsContent value="import-export">
                <DataImportExport />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
