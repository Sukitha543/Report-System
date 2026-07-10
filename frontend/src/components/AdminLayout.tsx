import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LogOut } from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-black text-white px-6 py-4 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-purple-400" />
              <span className="text-xl font-bold tracking-tight">ReportSystem Admin</span>
            </div>
            
            <div className="hidden md:flex space-x-6 text-sm font-medium">
              <NavLink 
                to="/admin" 
                end
                className={({ isActive }) => 
                  `transition-colors ${isActive ? 'text-white font-bold' : 'text-gray-400 hover:text-gray-200'}`
                }
              >
                Dashboard
              </NavLink>
              <NavLink 
                to="/admin/employees" 
                className={({ isActive }) => 
                  `transition-colors ${isActive ? 'text-white font-bold' : 'text-gray-400 hover:text-gray-200'}`
                }
              >
                Team Members
              </NavLink>
              <NavLink 
                to="/admin/projects" 
                className={({ isActive }) => 
                  `transition-colors ${isActive ? 'text-white font-bold' : 'text-gray-400 hover:text-gray-200'}`
                }
              >
                Projects
              </NavLink>
              <NavLink 
                to="/admin/reports" 
                className={({ isActive }) => 
                  `transition-colors ${isActive ? 'text-white font-bold' : 'text-gray-400 hover:text-gray-200'}`
                }
              >
                Team Reports
              </NavLink>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-gray-300 text-sm hidden sm:block">
              Welcome, {user?.profile?.firstName || 'Admin'}
            </span>
            <button 
              onClick={logout}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col">
        <Outlet />
      </div>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-gray-200 bg-white">
        <p className="text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Report System. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default AdminLayout;
