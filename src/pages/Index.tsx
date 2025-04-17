
import { Link } from "react-router-dom";
import Dashboard from "@/components/dashboard/Dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { FaChartLine, FaClipboard, FaUsers, FaFileInvoiceDollar } from "react-icons/fa";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
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
