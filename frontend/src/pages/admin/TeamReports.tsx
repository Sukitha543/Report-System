import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Filter, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface Employee {
  _id: string;
  employeeID: string;
  firstName: string;
  lastName: string;
  user: {
    email: string;
  };
}

interface Project {
  _id: string;
  projectName: string;
}

interface Report {
  _id: string;
  week: string;
  employee: Employee;
  project: Project;
  completedTasks: string;
  plannedTasks: string;
  blockers: string;
  hoursWorked: number;
  notes: string;
  status: 'draft' | 'submitted' | 'pending' | 'late';
  submittedAt: string;
}

interface TeamStatus {
  employee: Employee;
  status: 'pending' | 'late' | 'submitted';
  reports: Report[];
}

const getCurrentWeek = () => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
};

const TeamReports = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'tracker' | 'search'>('tracker');
  
  // Tracker State
  const [trackerWeek, setTrackerWeek] = useState(getCurrentWeek());
  const [teamStatus, setTeamStatus] = useState<TeamStatus[]>([]);
  
  // Search State
  const [reports, setReports] = useState<Report[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    employeeId: 'all',
    projectId: 'all',
    week: ''
  });

  // Fetch initial data
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [empRes, projRes] = await Promise.all([
          axios.get('/admin/employees'),
          axios.get('/admin/projects')
        ]);
        setEmployees(empRes.data);
        setProjects(projRes.data);
      } catch (err) {
        console.error('Failed to fetch dropdown data', err);
      }
    };
    fetchDropdownData();
  }, []);

  // Fetch Tracker Data
  useEffect(() => {
    if (activeTab === 'tracker') {
      const fetchStatus = async () => {
        try {
          const res = await axios.get(`/admin/reports/team-status?week=${trackerWeek}`);
          setTeamStatus(res.data);
        } catch (err) {
          console.error('Failed to fetch team status', err);
        }
      };
      fetchStatus();
    }
  }, [trackerWeek, activeTab]);

  // Fetch Search Data
  const handleSearch = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.employeeId !== 'all') params.append('employeeId', filters.employeeId);
      if (filters.projectId !== 'all') params.append('projectId', filters.projectId);
      if (filters.week) {
        params.append('startWeek', filters.week);
        params.append('endWeek', filters.week);
      }

      const res = await axios.get(`/admin/reports?${params.toString()}`);
      setReports(res.data);
    } catch (err) {
      console.error('Failed to fetch reports', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'search') {
      handleSearch();
    }
  }, [activeTab]); // Fetch once when switching to search, then wait for manual search clicks

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Submitted</span>;
      case 'late':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">Late</span>;
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">Pending</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full p-6 mt-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          Team Reports
        </h1>
        <p className="text-gray-500 mt-1">Track and review weekly submissions from all employees.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`pb-4 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'tracker' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('tracker')}
        >
          Weekly Submission Tracker
        </button>
        <button
          className={`pb-4 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'search' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('search')}
        >
          Advanced Search
        </button>
      </div>

      {activeTab === 'tracker' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Submission Status</h2>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Select Week:</label>
              <input
                type="week"
                value={trackerWeek}
                onChange={(e) => setTrackerWeek(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                  <th className="p-4 font-medium">Employee</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Reports Submitted</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teamStatus.map((item) => {
                  const hasSubmitted = item.reports.filter(r => r.status === 'submitted' || r.status === 'late');
                  return (
                    <tr key={item.employee._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">
                          {item.employee.firstName} {item.employee.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{item.employee.employeeID}</div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {hasSubmitted.length > 0 ? (
                          <span>{hasSubmitted.length} report(s)</span>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {hasSubmitted.length > 0 && (
                          <button 
                            onClick={() => {
                              navigate(`/admin/reports/employee/${item.employee._id}?week=${trackerWeek}`);
                            }}
                            className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors"
                          >
                            View Reports
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4 text-gray-700">
              <Filter className="h-4 w-4" />
              <h3 className="font-medium">Filter Reports</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Employee</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white"
                  value={filters.employeeId}
                  onChange={(e) => setFilters({...filters, employeeId: e.target.value})}
                >
                  <option value="all">All Employees</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeID})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Project</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white"
                  value={filters.projectId}
                  onChange={(e) => setFilters({...filters, projectId: e.target.value})}
                >
                  <option value="all">All Projects</option>
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.projectName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Week</label>
                <input
                  type="week"
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white"
                  value={filters.week}
                  onChange={(e) => setFilters({...filters, week: e.target.value})}
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSearch}
                className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Search Reports
              </button>
            </div>
          </div>

          {/* Results list */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Search Results</h2>
              <span className="text-sm text-gray-500">{reports.length} reports found</span>
            </div>
            
            <div className="divide-y divide-gray-100">
              {reports.map((report) => (
                <div key={report._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div 
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setExpandedReport(expandedReport === report._id ? null : report._id)}
                  >
                    <div className="flex gap-6 items-center">
                      <div className="w-24">
                        <span className="text-sm font-semibold text-gray-900">{report.week}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {report.employee?.firstName} {report.employee?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {report.project?.projectName}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      {getStatusBadge(report.status)}
                      <div className="text-xs text-gray-400 w-32 text-right">
                        {report.submittedAt ? new Date(report.submittedAt).toLocaleDateString() : 'N/A'}
                      </div>
                      {expandedReport === report._id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {expandedReport === report._id && (
                    <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded-xl shadow-inner border border-gray-100">
                      <div>
                        <div className="mb-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1">
                            <FileText className="h-3 w-3" /> Completed Tasks
                          </h4>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.completedTasks}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Blockers</h4>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.blockers || 'None reported'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <div className="mb-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Planned for Next Week</h4>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.plannedTasks}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Hours Worked</h4>
                            <p className="text-sm font-medium text-blue-600">{report.hoursWorked || 'N/A'}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Notes</h4>
                            <p className="text-sm text-gray-700 truncate" title={report.notes}>{report.notes || 'None'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {reports.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                  No reports match your filters.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamReports;
