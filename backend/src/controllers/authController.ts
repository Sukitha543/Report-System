import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, Employee, Admin } from '../models/index.js';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Set session data
    req.session.userId = user._id.toString();
    req.session.role = user.role;

    // Fetch related profile based on role
    let profile = null;
    if (user.role === 'admin') {
      profile = await Admin.findOne({ user: user._id });
    } else {
      profile = await Employee.findOne({ user: user._id });
    }

    res.json({
      message: 'Logged in successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const logout = (req: Request, res: Response): void => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ message: 'Failed to logout' });
      return;
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.session.userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    let profile = null;
    if (user.role === 'admin') {
      profile = await Admin.findOne({ user: user._id });
    } else {
      profile = await Employee.findOne({ user: user._id });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
