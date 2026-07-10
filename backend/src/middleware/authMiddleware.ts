import type { Request, Response, NextFunction } from 'express';

// Extend express session to include userId and role
declare module 'express-session' {
  interface SessionData {
    userId: string;
    role: string;
  }
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized, please log in' });
  }
};

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

export const employeeOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.role === 'employee') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as employee' });
  }
};
