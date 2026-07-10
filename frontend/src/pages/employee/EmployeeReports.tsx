import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Edit2, FileText, X } from 'lucide-react';

interface Project {
  _id: string;
  projectName: string;
}

interface Report {
  _id: string;
  week: string;
  project: { _id: string; projectName: string } | string;
  completedTasks: string;
  plannedTasks: string;
  blockers: string;
  hoursWorked: number | '';
  notes: string;
  status: 'draft' | 'submitted' | 'pending' | 'late';
  submittedAt?: string;
}

const EmployeeReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'submitted'>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, projectsRes] = await Promise.all([
          axios.get('/employees/reports'),
          axios.get('/employees/projects')
        ]);
        setReports(reportsRes.data);
        setProjects(projectsRes.data);
      } catch {
        console.error('Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Submitted</span>;
      case 'draft':
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Draft</span>;
      default:
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  const filteredAndSortedReports = reports
    .filter(r => {
      const statusMatch = filterStatus === 'all' || r.status === filterStatus;
      const projectMatch = filterProject === 'all' || 
        (typeof r.project === 'object' ? r.project._id === filterProject : r.project === filterProject);
      return statusMatch && projectMatch;
    })
    .sort((a, b) => {
      // Sort drafts to the top
      if (a.status === 'draft' && b.status !== 'draft') return -1;
      if (a.status !== 'draft' && b.status === 'draft') return 1;
      
      // Then sort by week (descending)
      return b.week.localeCompare(a.week);
    });

  return (
    <main className="max-w-7xl w-full mx-auto p-6 mt-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            My Report History
          </h1>
          <p className="text-gray-500 mt-1">View your past submissions and manage your drafts.</p>
        </div>
        <button
          onClick={() => navigate('/employee/submit')}
          className="bg-black text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-sm"
        >
          + New Report
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-wrap justify-between items-center bg-gray-50 gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <select
              className="text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm bg-white min-w-[150px]"
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
            >
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.projectName}</option>
              ))}
            </select>
            <select
              className="text-sm p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm bg-white min-w-[150px]"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">All Statuses</option>
              <option value="draft">Drafts Only</option>
              <option value="submitted">Submitted Only</option>
            </select>
          </div>
          <div className="bg-white border border-gray-200 text-gray-700 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm">
            {filteredAndSortedReports.length} Reports Found
          </div>
        </div>
        
        <div className="p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedReports.map((report) => (
              <div 
                key={report._id} 
                onClick={() => setSelectedReport(report)}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Week {report.week}
                  </h3>
                  {getStatusBadge(report.status)}
                </div>
                
                <p className="text-sm text-blue-600 font-medium mb-4">
                  {typeof report.project === 'object' ? report.project.projectName : report.project}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    Click to view details
                  </span>
                  {report.status === 'draft' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/employee/submit', { state: { report } });
                      }}
                      className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
                    >
                      <Edit2 className="h-3 w-3" />
                      Edit Draft
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredAndSortedReports.length === 0 && (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No reports found</h3>
              <p className="text-gray-500">
                {reports.length === 0 
                  ? "You haven't created any reports yet. Click 'New Report' to get started."
                  : "Try adjusting your filters to see more results."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Report Details */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  Week {selectedReport.week}
                  {getStatusBadge(selectedReport.status)}
                </h2>
                <p className="text-blue-600 font-medium mt-1">
                  Project: {typeof selectedReport.project === 'object' ? selectedReport.project.projectName : selectedReport.project}
                </p>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-8">
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Completed Tasks</h4>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {selectedReport.completedTasks || 'No tasks listed.'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Planned for Next Week</h4>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {selectedReport.plannedTasks || 'No tasks listed.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedReport.blockers && (
                  <div>
                    <h4 className="text-sm font-bold text-red-900 uppercase tracking-wider mb-3">Blockers</h4>
                    <div className="bg-red-50 rounded-xl p-4 border border-red-100 text-red-800">
                      <p className="whitespace-pre-wrap text-sm">{selectedReport.blockers}</p>
                    </div>
                  </div>
                )}
                
                {selectedReport.notes && (
                  <div>
                    <h4 className="text-sm font-bold text-yellow-900 uppercase tracking-wider mb-3">Notes & Links</h4>
                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100 text-yellow-800">
                      <p className="whitespace-pre-wrap text-sm">{selectedReport.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {selectedReport.hoursWorked && (
                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium">
                  <span className="text-blue-500">⏱</span>
                  {selectedReport.hoursWorked} Hours Logged
                </div>
              )}
            </div>
            
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 p-6 flex justify-end">
              <button 
                onClick={() => setSelectedReport(null)}
                className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default EmployeeReports;
