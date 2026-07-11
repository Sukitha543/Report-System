import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { FileText, CheckCircle, AlertTriangle, Activity } from 'lucide-react';

interface DashboardStats {
  summary: {
    totalSubmittedThisWeek: number;
    complianceRate: number;
    openBlockersCount: number;
    totalPendingThisWeek: number;
  };
  trendData: { week: string; tasksCompleted: number }[];
  submissionStatus: { name: string; submitted: number; pending: number }[];
  workloadDistribution: { projectName: string; hours: number }[];
  recentActivity: any[];
}

const COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/admin/dashboard-stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]">Loading dashboard metrics...</div>;
  }

  if (!stats) {
    return <div className="p-6 text-center text-red-500">Failed to load dashboard data.</div>;
  }

  return (
    <main className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="h-6 w-6 text-blue-600" />
          Dashboard Overview
        </h1>
        <p className="text-gray-500 mt-1">High-level metrics and team performance insights.</p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Submitted This Week</p>
            <p className="text-2xl font-bold text-gray-900">{stats.summary.totalSubmittedThisWeek}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Compliance Rate</p>
            <p className="text-2xl font-bold text-gray-900">{stats.summary.complianceRate}%</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Open Blockers</p>
            <p className="text-2xl font-bold text-gray-900">{stats.summary.openBlockersCount}</p>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Line Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks Completed Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="week" tick={{fontSize: 12, fill: '#6B7280'}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#6B7280'}} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{stroke: '#E5E7EB', strokeWidth: 2}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Line type="monotone" dataKey="tasksCompleted" stroke="#2563EB" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Submission Status Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Week Submissions</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.submissionStatus} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#6B7280'}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#6B7280'}} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                <Bar dataKey="submitted" name="Submitted" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} />
                <Bar dataKey="pending" name="Pending" stackId="a" fill="#F87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workload Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Workload by Project (Recent)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.workloadDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="hours"
                  nameKey="projectName"
                >
                  {stats.workloadDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Reports Feed */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity Feed</h3>
          </div>
          <div className="space-y-4">
            {stats.recentActivity.map((report) => (
              <div key={report._id} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="mt-1">
                  <div className={`w-2 h-2 rounded-full ${report.status === 'late' ? 'bg-red-500' : 'bg-green-500'}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {report.employee?.firstName} {report.employee?.lastName} 
                    <span className="text-gray-500 font-normal"> submitted a report for </span> 
                    {report.project?.projectName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Week: {report.week} &bull; Status: <span className="capitalize">{report.status}</span> &bull; {new Date(report.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {stats.recentActivity.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No recent activity found.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
