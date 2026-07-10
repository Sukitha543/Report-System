import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LogOut, LayoutDashboard, Users, Briefcase, FileText } from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-blue-900 border-r border-blue-800 flex flex-col flex-shrink-0 sticky top-0 h-screen shadow-2xl">
        <div className="p-6 border-b border-blue-800">
          <div className="flex items-center gap-3">
            <Activity className="h-7 w-7 text-blue-300" />
            <span className="text-xl font-bold tracking-tight text-white">ReportSystem</span>
          </div>
          <div className="mt-1 text-xs text-blue-300/80 font-medium uppercase tracking-wider">
            Admin Portal
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-blue-700 text-white font-bold border border-blue-600 shadow-sm' 
                  : 'text-blue-200 hover:text-white hover:bg-blue-800'
              }`
            }
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/employees"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-blue-700 text-white font-bold border border-blue-600 shadow-sm' 
                  : 'text-blue-200 hover:text-white hover:bg-blue-800'
              }`
            }
          >
            <Users className="h-5 w-5" />
            Team Members
          </NavLink>

          <NavLink
            to="/admin/projects"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-blue-700 text-white font-bold border border-blue-600 shadow-sm' 
                  : 'text-blue-200 hover:text-white hover:bg-blue-800'
              }`
            }
          >
            <Briefcase className="h-5 w-5" />
            Projects
          </NavLink>

          <NavLink
            to="/admin/reports"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-blue-700 text-white font-bold border border-blue-600 shadow-sm' 
                  : 'text-blue-200 hover:text-white hover:bg-blue-800'
              }`
            }
          >
            <FileText className="h-5 w-5" />
            Team Reports
          </NavLink>
        </div>

        <div className="p-4 border-t border-blue-800">
          <div className="px-4 mb-4">
            <p className="text-xs text-blue-300/80 font-medium uppercase">Logged in as</p>
            <p className="text-sm text-white font-bold mt-1 truncate">
              {user?.profile?.firstName || 'Admin'} {user?.profile?.lastName || ''}
            </p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-blue-200 hover:text-white hover:bg-blue-800 rounded-xl transition-all"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header */}

        <div className="flex-grow p-6 md:p-8">
          <Outlet />
        </div>

        {/* Footer */}
        <footer className="py-6 border-t border-slate-200 bg-white px-8">
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} Report System. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
