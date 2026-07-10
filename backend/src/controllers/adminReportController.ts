import type { Request, Response } from 'express';
import { Report, Employee, Project, ProjectAssignment } from '../models/index.js';

function getSundayOfISOWeek(weekStr: string): Date {
  const [yearStr, weekNumStr] = weekStr.split('-W') as [string, string];
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekNumStr, 10);

  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay();
  const isoDay = dayOfWeek === 0 ? 7 : dayOfWeek;
  
  const mondayOfWeek1 = new Date(year, 0, 4 - isoDay + 1);
  const targetMonday = new Date(mondayOfWeek1.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
  
  const targetSunday = new Date(targetMonday.getTime() + 6 * 24 * 60 * 60 * 1000);
  targetSunday.setHours(23, 59, 59, 999);
  
  return targetSunday;
}

export const getReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId, projectId, startWeek, endWeek } = req.query;

    const query: any = {};
    
    // Explicitly check that we only include submitted/late reports in the DB
    query.status = { $in: ['submitted', 'late'] };

    if (employeeId && employeeId !== 'all') {
      query.employee = employeeId;
    }
    if (projectId && projectId !== 'all') {
      query.project = projectId;
    }

    let isSingleWeekSearch = false;
    let targetSunday: Date | null = null;
    let isPastDeadline = false;

    if (startWeek || endWeek) {
      query.week = {};
      if (startWeek) query.week.$gte = startWeek;
      if (endWeek) query.week.$lte = endWeek;

      if (startWeek === endWeek && typeof startWeek === 'string') {
        isSingleWeekSearch = true;
        targetSunday = getSundayOfISOWeek(startWeek);
        isPastDeadline = Date.now() > targetSunday.getTime();
      }
    }

    const reports = await Report.find(query)
      .populate({
        path: 'employee',
        populate: { path: 'user', select: 'email' }
      })
      .populate('project', 'projectName')
      .sort({ week: -1, createdAt: -1 });

    const finalReports: any[] = reports.map(r => {
      const rep = r.toObject();
      const sunday = getSundayOfISOWeek(rep.week);
      if (rep.status === 'submitted' && rep.submittedAt && new Date(rep.submittedAt) > sunday) {
        rep.status = 'late';
      }
      return rep;
    });

    // If searching for a specific week, append pending/late unsubmitted reports based on assignments
    if (isSingleWeekSearch) {
      const assignmentQuery: any = {};
      if (employeeId && employeeId !== 'all') assignmentQuery.employee = employeeId;
      if (projectId && projectId !== 'all') assignmentQuery.project = projectId;

      const assignments = await ProjectAssignment.find(assignmentQuery)
        .populate({
          path: 'employee',
          populate: { path: 'user', select: 'email' }
        })
        .populate('project', 'projectName');

      for (const assignment of assignments) {
        // Check if there's already a submitted report for this assignment in finalReports
        const hasReport = finalReports.find(
          r => r.employee._id.toString() === assignment.employee._id.toString() &&
               r.project._id.toString() === assignment.project._id.toString()
        );

        if (!hasReport) {
          finalReports.push({
            _id: `pending-${assignment.employee._id}-${assignment.project._id}`,
            week: startWeek,
            employee: assignment.employee,
            project: assignment.project,
            completedTasks: 'No report submitted yet.',
            plannedTasks: '-',
            blockers: '-',
            hoursWorked: 0,
            notes: '',
            status: isPastDeadline ? 'late' : 'pending',
            submittedAt: null
          });
        }
      }
    }

    res.json(finalReports);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const getTeamStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const week = req.query.week as string;
    
    if (!week) {
      res.status(400).json({ message: 'Week parameter is required' });
      return;
    }

    const targetSunday = getSundayOfISOWeek(week);
    const isPastDeadline = Date.now() > targetSunday.getTime();

    // Get all assignments and populate employee and project
    const assignments = await ProjectAssignment.find()
      .populate({
        path: 'employee',
        populate: { path: 'user', select: 'email' }
      })
      .populate('project', 'projectName');
    
    const reports = await Report.find({ week }).populate('project', 'projectName');

    const statusList = assignments.map(assignment => {
      // Find report for this specific employee AND project
      const empProjectReport = reports.find(
        r => r.employee.toString() === assignment.employee._id.toString() &&
             r.project._id.toString() === assignment.project._id.toString()
      );
      
      let computedStatus = 'pending';
      let relatedReports = empProjectReport ? [empProjectReport] : [];

      if (empProjectReport && (empProjectReport.status === 'submitted' || empProjectReport.status === 'late')) {
        // They submitted a report for this project. Is it late?
        if (empProjectReport.status === 'late' || (empProjectReport.submittedAt && empProjectReport.submittedAt > targetSunday)) {
          computedStatus = 'late';
        } else {
          computedStatus = 'submitted';
        }
      } else {
        // No submitted report for this project
        if (isPastDeadline) {
          computedStatus = 'late'; 
        } else {
          computedStatus = 'pending'; 
        }
      }

      return {
        // We use a unique ID for React mapping (employee + project)
        _id: `${assignment.employee._id}-${assignment.project._id}`,
        employee: assignment.employee,
        project: assignment.project,
        status: computedStatus,
        reports: relatedReports
      };
    });

    res.json(statusList);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
