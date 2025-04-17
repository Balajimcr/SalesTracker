
import { Link } from "react-router-dom";
import Dashboard from "@/components/dashboard/Dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { FaChartLine, FaClipboard, FaUsers, FaFileInvoiceDollar } from "react-icons/fa";

const Index = () => {
  // Mock user data - in a real app this would come from authentication
  const userData = {
    name: "John",
    role: "Store Manager"
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="absolute top-4 right-6 flex items-center gap-3 py-2 px-4 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-blue-100">
        <div className="flex flex-col items-end">
          <p className="text-sm font-medium text-gray-800">Welcome, {userData.name}</p>
          <p className="text-xs text-gray-500">{userData.role}</p>
        </div>
        <div className="h-8 w-8 rounded-full bg-shop-primary text-white flex items-center justify-center text-sm font-medium">
          {userData.name.charAt(0)}
        </div>
      </div>
      
      <Dashboard />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-blue-100 hover:border-blue-300">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <FaChartLine className="text-shop-primary text-xl" />
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Daily Reports</h3>
              <p className="text-gray-600 text-sm">Track your daily sales performance and metrics</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-blue-100 hover:border-blue-300">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <FaClipboard className="text-shop-primary text-xl" />
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Inventory Management</h3>
              <p className="text-gray-600 text-sm">Keep track of your store inventory efficiently</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-blue-100 hover:border-blue-300">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <FaUsers className="text-shop-primary text-xl" />
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Staff Management</h3>
              <p className="text-gray-600 text-sm">Manage your employees and their schedules</p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-blue-100 hover:border-blue-300">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <FaFileInvoiceDollar className="text-shop-primary text-xl" />
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Financial Overview</h3>
              <p className="text-gray-600 text-sm">Get insights into your business finances</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
