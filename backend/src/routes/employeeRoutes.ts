import express from 'express';
import { registerUserAccount } from '../controllers/employeeController.js';
import { createReport, getReports, updateReport, getProjects } from '../controllers/reportController.js';
import { protect, employeeOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for initial employee registration
router.post('/register', registerUserAccount);

// Protected routes
router.use(protect, employeeOnly);

router.route('/reports')
  .post(createReport)
  .get(getReports);

router.route('/reports/:id')
  .put(updateReport);

router.get('/projects', getProjects);

export default router;
