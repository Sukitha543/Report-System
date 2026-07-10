import type { Request, Response } from 'express';
import { Report, Employee, Project, ProjectAssignment } from '../models/index.js';

const getCurrentWeek = () => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
};

const getPastWeeks = (numWeeks: number): string[] => {
  const weeks: string[] = [];
  const current = new Date();
  for (let i = numWeeks - 1; i >= 0; i--) {
    const d = new Date(current.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    weeks.push(`${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`);
  }
  return weeks;
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentWeek = getCurrentWeek();

    // 1. Fetch current week's assignments and reports
    const assignments = await ProjectAssignment.find()
      .populate('employee', 'firstName lastName')
      .populate('project', 'projectName');
      
    const currentWeekReports = await Report.find({ week: currentWeek })
      .populate('employee', 'firstName lastName')
      .populate('project', 'projectName');

    // Filter to only submitted/late for the "submitted" count
    const submittedCurrentWeek = currentWeekReports.filter(r => r.status === 'submitted' || r.status === 'late');

    // --- SUMMARY METRICS ---
    const totalSubmittedThisWeek = submittedCurrentWeek.length;
    const totalAssignments = assignments.length;
    
    // Compliance Rate = (Submitted / Total Assignments) * 100
    const complianceRate = totalAssignments > 0 
      ? Math.round((totalSubmittedThisWeek / totalAssignments) * 100) 
      : 0;

    // Number of open blockers
    const openBlockersCount = submittedCurrentWeek.filter(r => r.blockers && r.blockers.trim().length > 0 && r.blockers.trim() !== '-').length;

    // --- TREND DATA (Last 6 weeks) ---
    const pastWeeks = getPastWeeks(6);
    const pastReports = await Report.find({ 
      week: { $in: pastWeeks },
      status: { $in: ['submitted', 'late'] }
    });

    const trendData = pastWeeks.map(week => {
      const reportsForWeek = pastReports.filter(r => r.week === week);
      let tasksCount = 0;
      reportsForWeek.forEach(r => {
        if (r.completedTasks) {
          // Estimate task count by splitting by newline and filtering out empty lines
          const lines = r.completedTasks.split('\n').filter(l => l.trim().length > 0);
          tasksCount += lines.length;
        }
      });
      return {
        week,
        tasksCompleted: tasksCount
      };
    });

    // --- SUBMISSION STATUS BY TEAM MEMBER ---
    // Using current week
    const memberStatusMap: Record<string, { name: string; submitted: number; pending: number }> = {};
    
    assignments.forEach(a => {
      if (!a.employee || !a.project) return;
      const empId = a.employee._id.toString();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const empName = `${(a.employee as any).firstName} ${(a.employee as any).lastName}`;
      
      if (!memberStatusMap[empId]) {
        memberStatusMap[empId] = { name: empName, submitted: 0, pending: 0 };
      }

      const hasSubmitted = submittedCurrentWeek.find(
        r => r.employee?._id?.toString() === empId && r.project?._id?.toString() === a.project._id.toString()
      );

      if (hasSubmitted) {
        memberStatusMap[empId].submitted += 1;
      } else {
        memberStatusMap[empId].pending += 1;
      }
    });
    
    const submissionStatus = Object.values(memberStatusMap);

    // --- WORKLOAD / TASK DISTRIBUTION BY PROJECT ---
    // Let's refine the pastReports fetch to populate project.
    const pastReportsPopulated = await Report.find({ 
      week: { $in: pastWeeks },
      status: { $in: ['submitted', 'late'] }
    }).populate('project', 'projectName');

    const accurateProjectWorkloadMap: Record<string, { projectName: string; hours: number }> = {};
    pastReportsPopulated.forEach(r => {
      if (r.project && r.hoursWorked) {
        const projId = r.project._id.toString();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const projName = (r.project as any).projectName;
        if (!accurateProjectWorkloadMap[projId]) {
          accurateProjectWorkloadMap[projId] = { projectName: projName, hours: 0 };
        }
        accurateProjectWorkloadMap[projId].hours += Number(r.hoursWorked);
      }
    });
    
    const workloadDistribution = Object.values(accurateProjectWorkloadMap);

    // --- RECENT REPORTS ---
    const recentActivity = await Report.find({ status: { $in: ['submitted', 'late'] } })
      .populate('employee', 'firstName lastName')
      .populate('project', 'projectName')
      .sort({ submittedAt: -1, createdAt: -1 })
      .limit(5);

    res.json({
      summary: {
        totalSubmittedThisWeek,
        complianceRate,
        openBlockersCount,
        totalPendingThisWeek: totalAssignments - totalSubmittedThisWeek
      },
      trendData,
      submissionStatus,
      workloadDistribution,
      recentActivity
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
