
import { useState, useRef } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { 
  exportEmployeesToCSV, 
  exportSalaryDataToCSV,
  exportSalesDataToCSV,
  importEmployeesFromCSV,
  importSalaryDataFromCSV,
  importSalesDataFromCSV,
  getEmployeeTemplate,
  getSalesTemplate,
  downloadCSV
} from "@/utils/csvUtils";
import { FileUp, FileDown, FileText, Import, Download } from "lucide-react";

const DataImportExport = () => {
  const [activeTab, setActiveTab] = useState("employees");
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    
    try {
      switch (activeTab) {
        case "employees":
          await importEmployeesFromCSV(file);
          break;
        case "salary":
          await importSalaryDataFromCSV(file);
          break;
        case "sales":
          await importSalesDataFromCSV(file);
          break;
      }
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Import error:", error);
    } finally {
      setIsImporting(false);
    }
  };
  
  const handleExport = () => {
    switch (activeTab) {
      case "employees":
        exportEmployeesToCSV();
        break;
      case "salary":
        exportSalaryDataToCSV();
        break;
      case "sales":
        exportSalesDataToCSV();
        break;
    }
  };
  
  const handleDownloadTemplate = () => {
    switch (activeTab) {
      case "employees":
        downloadCSV(getEmployeeTemplate(), "employee_template.csv");
        toast.success("Employee template downloaded");
        break;
      case "sales":
        downloadCSV(getSalesTemplate(), "sales_template.csv");
        toast.success("Sales template downloaded");
        break;
      case "salary":
        toast.info("Salary templates are not available. Please export current data as reference.");
        break;
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <span>Data Import & Export</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="employees">Employees</TabsTrigger>
              <TabsTrigger value="salary">Salary Data</TabsTrigger>
              <TabsTrigger value="sales">Sales Records</TabsTrigger>
            </TabsList>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download Template
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    onClick={handleDownloadTemplate}
                    className="w-full"
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Download CSV Template
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Import className="h-4 w-4" />
                    Import Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <input
                      type="file"
                      id="csv-upload"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      ref={fileInputRef}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                      disabled={isImporting}
                    >
                      <FileUp className="mr-2 h-4 w-4" />
                      {isImporting ? "Importing..." : "Import CSV File"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileDown className="h-4 w-4" />
                    Export Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    onClick={handleExport}
                    className="w-full"
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Export to CSV
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <TabsContent value="employees" className="p-4 border rounded-md bg-gray-50">
              <h3 className="text-lg font-medium mb-2">Employee Data</h3>
              <p className="text-sm text-gray-600 mb-4">
                Import or export employee information including names, mobile numbers, and joining dates.
              </p>
              <div className="space-y-2">
                <h4 className="font-medium">Format Information:</h4>
                <p className="text-sm text-gray-600">
                  The CSV should contain the following columns: name, mobile, joiningDate
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="salary" className="p-4 border rounded-md bg-gray-50">
              <h3 className="text-lg font-medium mb-2">Salary & Advance Data</h3>
              <p className="text-sm text-gray-600 mb-4">
                Import or export salary information and advance payments for employees.
              </p>
              <div className="space-y-2">
                <h4 className="font-medium">Format Information:</h4>
                <p className="text-sm text-gray-600">
                  The CSV should contain records for both salary and advances with appropriate type indicators.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="sales" className="p-4 border rounded-md bg-gray-50">
              <h3 className="text-lg font-medium mb-2">Sales Records</h3>
              <p className="text-sm text-gray-600 mb-4">
                Import or export daily sales records, expenses, and cash management data.
              </p>
              <div className="space-y-2">
                <h4 className="font-medium">Format Information:</h4>
                <p className="text-sm text-gray-600">
                  The CSV should contain all sales record fields including date, cash amounts, and sales figures.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataImportExport;
