
import { Link } from "react-router-dom";
import Dashboard from "@/components/dashboard/Dashboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Dashboard />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link 
            to="/salary-management" 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Employee Salary Management
            </h2>
            <p className="text-gray-600">
              Manage employee advances, transfers, and salary records.
            </p>
          </Link>
          {/* Add more links as needed */}
        </div>
      </div>
    </div>
  );
};

export default Index;
