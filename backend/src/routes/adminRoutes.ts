import express from 'express';
import { createEmployee, getEmployees } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.route('/employees')
  .post(createEmployee)
  .get(getEmployees);

export default router;
