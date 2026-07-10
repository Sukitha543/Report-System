import type { Request, Response } from 'express';
import { Project, Admin, ProjectAssignment, Report } from '../models/index.js';

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectName, description, employeeIds } = req.body;
    const userId = req.session.userId as string;

    const admin = await Admin.findOne({ user: userId });
    if (!admin) {
      res.status(403).json({ message: 'Only admins can create projects.' });
      return;
    }

    const project = new Project({
      admin: admin._id,
      projectName,
      description
    });

    await project.save();

    if (employeeIds && Array.isArray(employeeIds)) {
      const assignments = employeeIds.map(empId => ({
        employee: empId,
        project: project._id
      }));
      if (assignments.length > 0) {
        await ProjectAssignment.insertMany(assignments);
      }
    }

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const projects = await Project.find().sort({ createdDate: -1 }).populate('admin', 'firstName lastName').lean();
    
    // Fetch assignments for all these projects
    const assignments = await ProjectAssignment.find({
      project: { $in: projects.map(p => p._id) }
    }).populate('employee', 'firstName lastName EmployeeID');

    // Attach assignments to projects
    const projectsWithEmployees = projects.map(p => {
      const projectEmployees = assignments
        .filter(a => a.project.toString() === p._id.toString())
        .map(a => a.employee);
      
      return {
        ...p,
        employees: projectEmployees
      };
    });

    res.json(projectsWithEmployees);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { projectName, description, employeeIds } = req.body;

    const project = await Project.findByIdAndUpdate(
      id,
      { projectName, description },
      { new: true, runValidators: true }
    );

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    if (employeeIds && Array.isArray(employeeIds)) {
      // Clear existing assignments for this project
      await ProjectAssignment.deleteMany({ project: id as string });
      
      const assignments = employeeIds.map(empId => ({
        employee: empId,
        project: id
      }));
      if (assignments.length > 0) {
        await ProjectAssignment.insertMany(assignments);
      }
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // Clean up assignments
    await ProjectAssignment.deleteMany({ project: id as string });

    // Clean up reports associated with the project
    await Report.deleteMany({ project: id as string });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
