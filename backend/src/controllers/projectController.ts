import type { Request, Response } from 'express';
import { Project, Admin } from '../models/index.js';

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectName, description } = req.body;
    const userId = req.session.userId as string;

    // Find the admin associated with this user
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
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    // Optionally we can filter by admin, but typically an admin sees all projects
    // or projects they created. We'll return all projects for now.
    const projects = await Project.find().sort({ createdDate: -1 }).populate('admin', 'firstName lastName');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { projectName, description } = req.body;

    const project = await Project.findByIdAndUpdate(
      id,
      { projectName, description },
      { new: true, runValidators: true }
    );

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
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

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
