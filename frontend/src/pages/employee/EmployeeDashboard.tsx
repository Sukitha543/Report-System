import { FileText } from 'lucide-react';

const EmployeeDashboard = () => {

  return (
    <main className="max-w-5xl w-full mx-auto p-6 mt-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to your Dashboard</h1>
        <p className="text-gray-500 max-w-md mx-auto">
          You have successfully set up your account. From here, you will be able to submit your weekly work reports and track your project assignments.
        </p>
        <p className="text-sm text-gray-400 mt-8">
          Navigate to "My Reports" to start tracking your work.
        </p>
      </div>
    </main>
  );
};

export default EmployeeDashboard;
