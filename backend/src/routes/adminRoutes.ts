import express from 'express';
import { createEmployee, getEmployees } from '../controllers/adminController.js';
import { createProject, getProjects, updateProject, deleteProject } from '../controllers/projectController.js';
import { getReports, getTeamStatus } from '../controllers/adminReportController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.route('/employees')
  .post(createEmployee)
  .get(getEmployees);

router.route('/projects')
  .post(createProject)
  .get(getProjects);

router.route('/projects/:id')
  .put(updateProject)
  .delete(deleteProject);

router.get('/reports', getReports);
router.get('/reports/team-status', getTeamStatus);

export default router;
