
import SalesEntryForm from "./SalesEntryForm";
import { FaShoppingBag } from "react-icons/fa";

const Dashboard = () => {
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
          Enter the details below to record your daily sales information.
        </p>
      </header>

      <main>
        <SalesEntryForm />
      </main>
    </div>
  );
};

export default Dashboard;
