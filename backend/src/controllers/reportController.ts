import type { Request, Response } from 'express';
import { Report, Employee, Project, ProjectAssignment } from '../models/index.js';

export const createReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.session.userId as string;
    const employee = await Employee.findOne({ user: userId });
    
    if (!employee) {
      res.status(403).json({ message: 'Only employees can create reports.' });
      return;
    }

    const { week, project, completedTasks, plannedTasks, blockers, hoursWorked, notes, status } = req.body;

    const report = new Report({
      employee: employee._id,
      week,
      project,
      completedTasks,
      plannedTasks,
      blockers,
      hoursWorked,
      notes,
      status: status || 'draft',
      submittedAt: status === 'submitted' ? new Date() : undefined
    });

    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const getReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.session.userId as string;
    const employee = await Employee.findOne({ user: userId });
    
    if (!employee) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    const reports = await Report.find({ employee: employee._id })
      .populate('project', 'projectName')
      .sort({ week: -1, createdAt: -1 });
      
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const updateReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.session.userId as string;
    const employee = await Employee.findOne({ user: userId });
    
    if (!employee) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    const { week, project, completedTasks, plannedTasks, blockers, hoursWorked, notes, status } = req.body;

    const report = await Report.findOne({ _id: id, employee: employee._id });

    if (!report) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }

    // Don't allow updating if already submitted (optional rule, but standard)
    if (report.status === 'submitted') {
      res.status(400).json({ message: 'Cannot edit a submitted report' });
      return;
    }

    report.week = week;
    report.project = project;
    report.completedTasks = completedTasks;
    report.plannedTasks = plannedTasks;
    report.blockers = blockers;
    report.hoursWorked = hoursWorked;
    report.notes = notes;
    report.status = status;
    
    if (status === 'submitted') {
      report.submittedAt = new Date();
    }

    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.session.userId as string;
    const employee = await Employee.findOne({ user: userId });
    
    if (!employee) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    const assignments = await ProjectAssignment.find({ employee: employee._id });
    const projectIds = assignments.map(a => a.project);

    const projects = await Project.find({ _id: { $in: projectIds } }).sort({ projectName: 1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
