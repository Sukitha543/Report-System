import type { Request, Response } from 'express';
import { Employee } from '../models/index.js';

export const createEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, address, contactNumber } = req.body;

    // Generate next Employee ID
    const lastEmployee = await Employee.findOne().sort({ employeeID: -1 });
    let nextIdNumber = 1;
    
    if (lastEmployee && lastEmployee.employeeID) {
      const lastIdStr = lastEmployee.employeeID.substring(1);
      nextIdNumber = parseInt(lastIdStr, 10) + 1;
    }

    const employeeID = `E${nextIdNumber.toString().padStart(3, '0')}`;

    const newEmployee = new Employee({
      employeeID,
      firstName,
      lastName,
      address,
      contactNumber
    });

    await newEmployee.save();

    res.status(201).json({
      message: 'Employee created successfully',
      employee: newEmployee
    });
  } catch (error) {
    console.error('Create Employee Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
