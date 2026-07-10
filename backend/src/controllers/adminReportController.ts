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
    
    // Explicitly check that we only include submitted reports for admins, or maybe allow them to see drafts?
    // Usually admins only see submitted/late reports. 
    query.status = { $in: ['submitted', 'late'] };

    if (employeeId && employeeId !== 'all') {
      query.employee = employeeId;
    }
    if (projectId && projectId !== 'all') {
      query.project = projectId;
    }

    if (startWeek || endWeek) {
      query.week = {};
      if (startWeek) query.week.$gte = startWeek;
      if (endWeek) query.week.$lte = endWeek;
    }

    const reports = await Report.find(query)
      .populate({
        path: 'employee',
        populate: { path: 'user', select: 'email' }
      })
      .populate('project', 'projectName')
      .sort({ week: -1, createdAt: -1 });

    res.json(reports);
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

    // Only get employees that are assigned to at least one project
    const assignedEmployeeIds = await ProjectAssignment.find().distinct('employee');
    const employees = await Employee.find({ _id: { $in: assignedEmployeeIds } }).populate('user', 'email');
    
    const reports = await Report.find({ week }).populate('project', 'projectName');

    const statusList = employees.map(emp => {
      // Allow for multiple reports per week? Usually 1 per project or just 1 overall.
      // In this system they might submit multiple per week if they work on multiple projects.
      // But we just check if they submitted *any* report for the week to mark them as completed/late.
      // We will grab all their reports for the week.
      const empReports = reports.filter(r => r.employee.toString() === emp._id.toString());
      
      // Filter out drafts to see if they actually submitted anything
      const submittedReports = empReports.filter(r => r.status === 'submitted' || r.status === 'late');
      
      let computedStatus = 'pending';
      let relatedReports = empReports;

      if (submittedReports.length > 0) {
        // They submitted at least one report. Is it late?
        // We'll check the earliest submission or latest. Let's just check if ANY were submitted before deadline.
        // Actually, just check if the first one was late.
        const firstSubmitted = submittedReports[0];
        
        // Use the saved status if it's already 'late', otherwise compute
        if (firstSubmitted!.status === 'late' || (firstSubmitted!.submittedAt && firstSubmitted!.submittedAt > targetSunday)) {
          computedStatus = 'late';
        } else {
          computedStatus = 'submitted';
        }
      } else {
        // No submitted reports (either no reports at all, or only drafts)
        if (isPastDeadline) {
          computedStatus = 'late'; // They missed the deadline completely
        } else {
          computedStatus = 'pending'; // They still have time
        }
      }

      return {
        employee: emp,
        status: computedStatus,
        reports: empReports // Pass back all reports (including drafts maybe, but admin might not need to read drafts, just know they exist)
      };
    });

    res.json(statusList);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
