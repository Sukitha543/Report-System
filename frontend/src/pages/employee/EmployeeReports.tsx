import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Save, Send, Edit2 } from 'lucide-react';

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
  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'submitted'>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  
  const [formData, setFormData] = useState<Partial<Report>>({
    week: '',
    project: '',
    completedTasks: '',
    plannedTasks: '',
    blockers: '',
    hoursWorked: '',
    notes: ''
  });
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const handleSave = async (status: 'draft' | 'submitted') => {
    setMessage('');
    
    // Basic validation
    if (!formData.week || !formData.project || !formData.completedTasks || !formData.plannedTasks) {
      setMessage('Please fill in all required fields (Week, Project, Completed Tasks, Planned Tasks).');
      return;
    }

    try {
      const payload = { ...formData, status };
      
      if (editingId) {
        await axios.put(`/employees/reports/${editingId}`, payload);
        setMessage(`Report ${status === 'submitted' ? 'submitted' : 'saved as draft'} successfully!`);
      } else {
        await axios.post('/employees/reports', payload);
        setMessage(`Report ${status === 'submitted' ? 'submitted' : 'saved as draft'} successfully!`);
      }
      
      // Reset form if submitted, otherwise keep it for further editing
      if (status === 'submitted') {
        setFormData({
          week: '', project: '', completedTasks: '', plannedTasks: '', blockers: '', hoursWorked: '', notes: ''
        });
        setEditingId(null);
      }
      
      fetchData();
    } catch {
      setMessage(`Failed to save report.`);
    }
  };

  const loadDraft = (report: Report) => {
    setEditingId(report._id);
    setFormData({
      week: report.week,
      project: typeof report.project === 'object' ? report.project._id : report.project,
      completedTasks: report.completedTasks,
      plannedTasks: report.plannedTasks,
      blockers: report.blockers || '',
      hoursWorked: report.hoursWorked || '',
      notes: report.notes || ''
    });
    setMessage('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Submitted</span>;
      case 'draft':
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">Draft</span>;
      default:
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">{status}</span>;
    }
  };

  const filteredReports = reports.filter(r => {
    const statusMatch = filterStatus === 'all' || r.status === filterStatus;
    const projectMatch = filterProject === 'all' || 
      (typeof r.project === 'object' ? r.project._id === filterProject : r.project === filterProject);
    return statusMatch && projectMatch;
  });

  return (
    <main className="max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
      
      {/* Left Column: Report Form */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Edit Draft Report' : 'New Weekly Report'}
            </h2>
          </div>
          
          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {message}
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Week *</label>
                <input
                  required
                  type="week"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={formData.week}
                  onChange={(e) => setFormData({...formData, week: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
                <select
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                  value={formData.project as string}
                  onChange={(e) => setFormData({...formData, project: e.target.value})}
                >
                  <option value="">Select a project</option>
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.projectName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tasks Completed *</label>
              <textarea
                required
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                rows={3}
                placeholder="What did you accomplish this week?"
                value={formData.completedTasks}
                onChange={(e) => setFormData({...formData, completedTasks: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Planned for Next Week *</label>
              <textarea
                required
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                rows={3}
                placeholder="What are your priorities for next week?"
                value={formData.plannedTasks}
                onChange={(e) => setFormData({...formData, plannedTasks: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blockers / Challenges</label>
              <textarea
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                rows={2}
                placeholder="Any issues blocking your progress?"
                value={formData.blockers}
                onChange={(e) => setFormData({...formData, blockers: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hours Worked</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={formData.hoursWorked}
                  onChange={(e) => setFormData({...formData, hoursWorked: e.target.value === '' ? '' : Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Links</label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Links to PRs, docs, etc."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => handleSave('draft')}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 p-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => handleSave('submitted')}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Send className="h-4 w-4" />
                Submit Report
              </button>
            </div>
            
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({ week: '', project: '', completedTasks: '', plannedTasks: '', blockers: '', hoursWorked: '', notes: '' });
                }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 mt-2"
              >
                Cancel Editing
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Right Column: Report History */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
            <h2 className="text-lg font-semibold text-gray-900">My Reports</h2>
            <div className="flex items-center gap-4">
              <select
                className="text-sm p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
              >
                <option value="all">All Projects</option>
                {projects.map(p => (
                  <option key={p._id} value={p._id}>{p.projectName}</option>
                ))}
              </select>
              <select
                className="text-sm p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="draft">Drafts</option>
                <option value="submitted">Submitted</option>
              </select>
              <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                {filteredReports.length} Total
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100 max-h-[700px] overflow-y-auto">
            {filteredReports.map((report) => (
              <div key={report._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Week: {report.week}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Project: {typeof report.project === 'object' ? report.project.projectName : report.project}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(report.status)}
                    {report.status === 'draft' && (
                      <button 
                        onClick={() => loadDraft(report)}
                        className="text-blue-600 hover:text-blue-800 p-1 transition-colors"
                        title="Edit Draft"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <strong className="text-gray-700 block text-xs uppercase tracking-wider mb-1">Completed</strong>
                    <p className="text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                      {report.completedTasks}
                    </p>
                  </div>
                  <div>
                    <strong className="text-gray-700 block text-xs uppercase tracking-wider mb-1">Planned</strong>
                    <p className="text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                      {report.plannedTasks}
                    </p>
                  </div>
                  {(report.blockers || report.hoursWorked) && (
                    <div className="flex gap-4 pt-2">
                      {report.hoursWorked && (
                        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded text-xs font-medium">
                          {report.hoursWorked} Hours
                        </div>
                      )}
                      {report.blockers && (
                        <div className="bg-red-50 text-red-700 px-3 py-1 rounded text-xs font-medium">
                          Blockers Reported
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {filteredReports.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                You haven't created any reports yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default EmployeeReports;
