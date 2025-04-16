import { Link } from "react-router-dom";
import Dashboard from "@/components/dashboard/Dashboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Dashboard />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add more links as needed */}
        </div>
      </div>
    </div>
  );
};

export default Index;
