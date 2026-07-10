import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, Employee } from '../models/index.js';

export const registerUserAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeID, email, password } = req.body;

    // Check if employee exists
    const employee = await Employee.findOne({ employeeID });
    if (!employee) {
      res.status(404).json({ message: 'Employee ID not found' });
      return;
    }

    if (employee.user) {
      res.status(400).json({ message: 'Account already exists for this Employee ID' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email is already in use' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      email,
      password: hashedPassword,
      role: 'employee'
    });

    await user.save();

    // Link user to employee
    employee.user = user._id;
    await employee.save();

    res.status(201).json({ message: 'Account created successfully. You can now login.' });
  } catch (error) {
    console.error('Register Employee Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
