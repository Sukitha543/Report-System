import { useAuth } from '../../context/AuthContext';
import { LogOut, Activity, FileText } from 'lucide-react';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-black text-white px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-blue-400" />
          <span className="text-xl font-bold tracking-tight">ReportSystem</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-gray-300 text-sm">Hello, {user?.profile?.firstName || 'Employee'}</span>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to your Dashboard</h1>
          <p className="text-gray-500 max-w-md mx-auto">
            You have successfully set up your account. From here, you will be able to submit your weekly work reports and track your project assignments.
          </p>
          <p className="text-sm text-gray-400 mt-8">
            Report submission features coming soon...
          </p>
        </div>
      </main>
      
      <footer className="mt-auto py-6 border-t border-gray-200 bg-white">
        <p className="text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Report System.
        </p>
      </footer>
    </div>
  );
};

export default EmployeeDashboard;
