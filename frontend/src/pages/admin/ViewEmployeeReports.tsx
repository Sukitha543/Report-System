import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileText, ArrowLeft, Calendar, User } from 'lucide-react';

interface Report {
  _id: string;
  week: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeID: string;
  };
  project: {
    _id: string;
    projectName: string;
  };
  completedTasks: string;
  plannedTasks: string;
  blockers: string;
  hoursWorked: number;
  notes: string;
  status: string;
  submittedAt: string;
}

const ViewEmployeeReports = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const [searchParams] = useSearchParams();
  const week = searchParams.get('week');
  const navigate = useNavigate();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        let url = `/admin/reports?employeeId=${employeeId}`;
        if (week) {
          url += `&startWeek=${week}&endWeek=${week}`;
        }
        const res = await axios.get(url);
        setReports(res.data);
      } catch (err) {
        console.error('Failed to fetch employee reports', err);
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchReports();
    }
  }, [employeeId, week]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading reports...</div>;
  }

  const employeeName = reports.length > 0 
    ? `${reports[0].employee.firstName} ${reports[0].employee.lastName}`
    : 'Employee';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Submitted</span>;
      case 'late':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">Late</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full p-6 mt-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tracker
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
          <User className="h-6 w-6 text-blue-600" />
          {employeeName}'s Reports
        </h1>
        {week && (
          <p className="text-gray-500 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Filtered by Week: {week}
          </p>
        )}
      </div>

      <div className="space-y-6">
        {reports.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500 shadow-sm">
            No submitted reports found for this period.
          </div>
        ) : (
          reports.map((report) => (
            <div key={report._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">Project: {report.project?.projectName}</h3>
                  <p className="text-sm text-gray-500">Week: {report.week}</p>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(report.status)}
                  <span className="text-xs text-gray-400">
                    Submitted: {report.submittedAt ? new Date(report.submittedAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Completed Tasks
                    </h4>
                    <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap border border-gray-100">
                      {report.completedTasks}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Blockers</h4>
                    <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap border border-gray-100">
                      {report.blockers || 'None reported'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <div className="mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Planned for Next Week</h4>
                    <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap border border-gray-100">
                      {report.plannedTasks}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">Hours Worked</h4>
                      <p className="text-lg font-semibold text-blue-900">{report.hoursWorked || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Notes</h4>
                      <p className="text-sm text-gray-700">{report.notes || 'None'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewEmployeeReports;
