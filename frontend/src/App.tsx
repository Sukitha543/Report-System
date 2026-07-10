import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import EmployeeRegister from './pages/EmployeeRegister';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';

import AdminLayout from './components/AdminLayout';
import EmployeeLayout from './components/EmployeeLayout';
import EmployeeReports from './pages/employee/EmployeeReports';
import ManageProjects from './pages/admin/ManageProjects';
import TeamReports from './pages/admin/TeamReports';
import ViewEmployeeReports from './pages/admin/ViewEmployeeReports';
import Dashboard from './pages/admin/Dashboard';
import ManageEmployees from './pages/admin/ManageEmployees';

const ProtectedRoute = ({ children, allowedRole }: { children: ReactNode, allowedRole: 'admin' | 'employee' }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== allowedRole) {
    // If they are logged in but wrong role, send them to their own dashboard
    return <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<EmployeeRegister />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="employees" element={<ManageEmployees />} />
            <Route path="projects" element={<ManageProjects />} />
            <Route path="reports" element={<TeamReports />} />
            <Route path="reports/employee/:employeeId" element={<ViewEmployeeReports />} />
          </Route>

          <Route
            path="/employee"
            element={
              <ProtectedRoute allowedRole="employee">
                <EmployeeLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<EmployeeDashboard />} />
            <Route path="reports" element={<EmployeeReports />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
