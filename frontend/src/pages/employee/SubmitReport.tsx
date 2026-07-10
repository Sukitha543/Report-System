import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, Save, Send, CheckCircle, AlertCircle } from 'lucide-react';

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

const SubmitReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState<Project[]>([]);
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
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get('/employees/projects');
        setProjects(res.data);
      } catch (err) {
        console.error('Failed to fetch projects', err);
      }
    };
    
    fetchProjects();

    // Check if we passed a draft report to edit
    if (location.state?.report) {
      const report: Report = location.state.report;
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
    }
  }, [location.state]);

  const handleSave = async (status: 'draft' | 'submitted') => {
    setAlertInfo(null);
    
    if (!formData.week || !formData.project || !formData.completedTasks || !formData.plannedTasks) {
      setAlertInfo({ type: 'error', message: 'Please fill in all required fields (Week, Project, Completed Tasks, Planned Tasks).' });
      return;
    }

    try {
      const payload = { ...formData, status };
      
      if (editingId) {
        await axios.put(`/employees/reports/${editingId}`, payload);
      } else {
        await axios.post('/employees/reports', payload);
      }
      
      setAlertInfo({ 
        type: 'success', 
        message: `Report successfully ${status === 'submitted' ? 'submitted' : 'saved as draft'}!` 
      });
      
      if (status === 'submitted') {
        setFormData({
          week: '', project: '', completedTasks: '', plannedTasks: '', blockers: '', hoursWorked: '', notes: ''
        });
        setEditingId(null);
        
        // Clear location state so refresh doesn't reload the draft
        window.history.replaceState({}, document.title);
        
        // Redirect to history after short delay for submitted reports
        setTimeout(() => navigate('/employee'), 1500);
      }
    } catch {
      setAlertInfo({ type: 'error', message: 'Failed to save report. Please try again.' });
    }
  };

  return (
    <main className="max-w-4xl w-full mx-auto p-6 mt-6">
      
      {alertInfo && (
        <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 shadow-sm transition-all animate-in fade-in slide-in-from-top-4 ${
          alertInfo.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {alertInfo.type === 'success' ? <CheckCircle className="h-5 w-5 mt-0.5 text-green-600" /> : <AlertCircle className="h-5 w-5 mt-0.5 text-red-600" />}
          <div>
            <h3 className={`font-semibold ${alertInfo.type === 'success' ? 'text-green-900' : 'text-red-900'}`}>
              {alertInfo.type === 'success' ? 'Success!' : 'Error'}
            </h3>
            <p className="text-sm mt-1">{alertInfo.message}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {editingId ? 'Edit Draft Report' : 'Submit Weekly Report'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Provide a detailed summary of your work progress for the week.
            </p>
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Week *</label>
              <input
                required
                type="week"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                value={formData.week}
                onChange={(e) => setFormData({...formData, week: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Project *</label>
              <select
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white shadow-sm"
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tasks Completed *</label>
            <textarea
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm leading-relaxed"
              rows={4}
              placeholder="What did you accomplish this week? Be specific."
              value={formData.completedTasks}
              onChange={(e) => setFormData({...formData, completedTasks: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Planned for Next Week *</label>
            <textarea
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm leading-relaxed"
              rows={3}
              placeholder="What are your main priorities and goals for next week?"
              value={formData.plannedTasks}
              onChange={(e) => setFormData({...formData, plannedTasks: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Blockers / Challenges <span className="text-gray-400 font-normal">(Optional)</span></label>
            <textarea
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm leading-relaxed"
              rows={2}
              placeholder="Are there any issues blocking your progress or slowing you down?"
              value={formData.blockers}
              onChange={(e) => setFormData({...formData, blockers: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hours Worked <span className="text-gray-400 font-normal">(Optional)</span></label>
              <input
                type="number"
                min="0"
                step="0.5"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                placeholder="e.g. 40"
                value={formData.hoursWorked}
                onChange={(e) => setFormData({...formData, hoursWorked: e.target.value === '' ? '' : Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notes / Links <span className="text-gray-400 font-normal">(Optional)</span></label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                placeholder="Links to PRs, Jira tickets, docs, etc."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6 mt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => handleSave('draft')}
              className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 p-4 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <Save className="h-5 w-5 text-gray-500" />
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave('submitted')}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 hover:shadow-md transition-all"
            >
              <Send className="h-5 w-5" />
              Submit Final Report
            </button>
          </div>
          
          {editingId && (
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({ week: '', project: '', completedTasks: '', plannedTasks: '', blockers: '', hoursWorked: '', notes: '' });
                  window.history.replaceState({}, document.title);
                }}
                className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors underline underline-offset-4"
              >
                Cancel Editing Draft
              </button>
            </div>
          )}
        </form>
      </div>
    </main>
  );
};

export default SubmitReport;
