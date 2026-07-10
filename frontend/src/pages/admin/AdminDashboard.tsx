import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Users, LogOut, PlusCircle, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    contactNumber: ''
  });
  const [message, setMessage] = useState('');

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('/admin/employees');
      setEmployees(res.data);
    } catch {
      console.error('Failed to fetch employees');
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEmployees();
  }, []);

  const handleAddEmployee = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      await axios.post('/admin/employees', formData);
      setMessage('Employee created successfully!');
      setFormData({ firstName: '', lastName: '', address: '', contactNumber: '' });
      fetchEmployees();
    } catch {
      setMessage('Failed to create employee.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-black text-white px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-purple-400" />
          <span className="text-xl font-bold tracking-tight">ReportSystem Admin</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-gray-300 text-sm">Welcome, {user?.profile?.firstName || 'Admin'}</span>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        
        {/* Left Column: Add Employee Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <PlusCircle className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Add New Employee</h2>
            </div>
            
            {message && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    required
                    type="text"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    required
                    type="text"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white p-3 rounded-lg font-medium hover:bg-gray-800 transition-colors mt-2"
              >
                Create Profile
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Employee List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
              </div>
              <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                {employees.length} Total
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-6 py-4 font-medium">ID</th>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Contact</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {employees.map((emp: any) => (
                    <tr key={emp._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-purple-700 bg-purple-100 rounded">
                          {emp.employeeID}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {emp.firstName} {emp.lastName}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {emp.contactNumber || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {emp.user ? (
                          <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded border border-green-100">Registered</span>
                        ) : (
                          <span className="text-amber-600 text-xs font-medium bg-amber-50 px-2 py-1 rounded border border-amber-100">Pending Setup</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No employees found. Add one to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-gray-200 bg-white">
        <p className="text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Report System. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default AdminDashboard;
