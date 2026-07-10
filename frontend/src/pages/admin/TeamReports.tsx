import React, { useState, useEffect, useMemo } from 'react';
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
  _id: string;
  employee: Employee;
  project: Project;
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
  const [expandedTrackerEmp, setExpandedTrackerEmp] = useState<string | null>(null);
  
  // Group teamStatus by Employee
  const groupedTeamStatus = useMemo(() => {
    const grouped = new Map<string, { employee: Employee, assignments: TeamStatus[] }>();
    for (const status of teamStatus) {
      if (!grouped.has(status.employee._id)) {
        grouped.set(status.employee._id, { employee: status.employee, assignments: [] });
      }
      grouped.get(status.employee._id)!.assignments.push(status);
    }
    return Array.from(grouped.values());
  }, [teamStatus]);

  // Search State
  const [reports, setReports] = useState<Report[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [expandedSearchEmp, setExpandedSearchEmp] = useState<string | null>(null);
  
  // Group reports by Employee for Advanced Search
  const groupedReports = useMemo(() => {
    const grouped = new Map<string, { employee: Employee, reports: Report[] }>();
    for (const report of reports) {
      if (!report.employee) continue; // safety check
      if (!grouped.has(report.employee._id)) {
        grouped.set(report.employee._id, { employee: report.employee, reports: [] });
      }
      grouped.get(report.employee._id)!.reports.push(report);
    }
    return Array.from(grouped.values());
  }, [reports]);

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
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium border border-green-200">Submitted</span>;
      case 'late':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium border border-red-200">Late</span>;
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium border border-yellow-200">Pending</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium border border-gray-200">{status}</span>;
    }
  };

  return (
    <div className="w-full">
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
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
          <div className="p-6 border-b border-blue-100 bg-blue-50/50 flex justify-between items-center">
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
                <tr className="bg-blue-50 text-blue-800 text-sm border-b border-blue-100">
                  <th className="p-4 font-medium">Employee</th>
                  <th className="p-4 font-medium">Projects Assigned</th>
                  <th className="p-4 font-medium">Progress</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {groupedTeamStatus.map(({ employee, assignments }) => {
                  const isExpanded = expandedTrackerEmp === employee._id;
                  const submittedCount = assignments.filter(a => a.status === 'submitted' || a.status === 'late').length;
                  const totalCount = assignments.length;
                  const hasSubmitted = submittedCount > 0;
                  
                  return (
                    <React.Fragment key={employee._id}>
                      <tr 
                        className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                        onClick={() => setExpandedTrackerEmp(isExpanded ? null : employee._id)}
                      >
                        <td className="p-4">
                          <div className="font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-xs text-gray-500">{employee.employeeID}</div>
                        </td>
                        <td className="p-4 text-gray-700">
                          {totalCount} Project{totalCount !== 1 ? 's' : ''}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${
                            submittedCount === totalCount ? 'bg-green-100 text-green-800 border-green-200' :
                            submittedCount > 0 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                            {submittedCount} / {totalCount} Submitted
                          </span>
                        </td>
                        <td className="p-4 text-right flex items-center justify-end gap-3 h-full">
                          {hasSubmitted && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/reports/employee/${employee._id}?week=${trackerWeek}`);
                              }}
                              className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm"
                            >
                              View Reports
                            </button>
                          )}
                          <div className={`p-2 rounded-full transition-colors ${isExpanded ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}>
                            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={4} className="p-0 border-t border-blue-100">
                            <div className="p-6 pl-12 bg-blue-50/40 shadow-inner">
                              <h4 className="text-xs font-bold uppercase text-blue-800 mb-3 tracking-wider">Project Breakdown</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {assignments.map(item => (
                                  <div key={item._id} className="bg-white p-4 rounded-xl border border-blue-100 flex flex-col justify-between items-start gap-2 shadow-sm">
                                    <span className="text-sm font-medium text-gray-800">{item.project.projectName}</span>
                                    {getStatusBadge(item.status)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
          <div className="bg-blue-50/30 rounded-2xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center gap-2 mb-4 text-blue-800">
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
                className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
              >
                Search Reports
              </button>
            </div>
          </div>

          {/* Results list */}
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
            <div className="p-6 border-b border-blue-100 flex justify-between items-center bg-blue-50/50">
              <h2 className="text-lg font-semibold text-blue-900">Search Results</h2>
              <span className="text-sm text-gray-500">{reports.length} reports found</span>
            </div>
            
            <div className="divide-y divide-gray-100">
              {groupedReports.map(({ employee, reports: empReports }) => (
                <div key={employee._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div 
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setExpandedSearchEmp(expandedSearchEmp === employee._id ? null : employee._id)}
                  >
                    <div className="flex gap-6 items-center">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                        {employee.firstName[0]}{employee.lastName[0]}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-lg">
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className="text-sm text-gray-500 font-medium mt-0.5">
                          {empReports.length} Report{empReports.length !== 1 ? 's' : ''} Found
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className={`p-2 rounded-full transition-colors ${expandedSearchEmp === employee._id ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}>
                        {expandedSearchEmp === employee._id ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                      </div>
                    </div>
                  </div>
                  
                  {expandedSearchEmp === employee._id && (
                    <div className="mt-6 pl-2 md:pl-16 space-y-4 border-t border-gray-100 pt-6">
                      {empReports.map((report) => (
                        <div key={report._id} className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
                          <div 
                            className="p-4 flex justify-between items-center cursor-pointer hover:bg-blue-50/50 transition-colors"
                            onClick={() => setExpandedReport(expandedReport === report._id ? null : report._id)}
                          >
                            <div className="flex gap-6 items-center">
                              <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-bold leading-none text-purple-700 bg-purple-100 rounded-full">{report.week}</span>
                              <div className="text-sm font-medium text-gray-900">{report.project?.projectName}</div>
                            </div>
                            <div className="flex items-center gap-6">
                              {getStatusBadge(report.status)}
                              <div className="text-xs text-gray-400 w-24 text-right hidden sm:block">
                                {report.submittedAt ? new Date(report.submittedAt).toLocaleDateString() : 'N/A'}
                              </div>
                              <div className={`p-1.5 rounded-full transition-colors ${expandedReport === report._id ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}>
                                {expandedReport === report._id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                              </div>
                            </div>
                          </div>
                          
                          {expandedReport === report._id && (
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 border-t border-slate-800 shadow-inner">
                              <div className="space-y-6">
                                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3 flex items-center gap-1">
                                    <FileText className="h-4 w-4" /> Completed Tasks
                                  </h4>
                                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{report.completedTasks}</p>
                                </div>
                                <div className="bg-red-50 p-5 rounded-xl border border-red-100 shadow-sm text-red-900">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-red-700 mb-3">Blockers</h4>
                                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{report.blockers || 'None reported'}</p>
                                </div>
                              </div>
                              
                              <div className="space-y-6">
                                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3">Planned for Next Week</h4>
                                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{report.plannedTasks}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">Hours</h4>
                                    <p className="text-lg font-bold text-blue-600">{report.hoursWorked || 'N/A'}</p>
                                  </div>
                                  <div className="bg-amber-50 p-5 rounded-xl border border-amber-100 shadow-sm">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">Notes</h4>
                                    <p className="text-sm text-amber-900 truncate" title={report.notes}>{report.notes || 'None'}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
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
