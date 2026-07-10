import express from 'express';
import { registerUserAccount } from '../controllers/employeeController.js';

const router = express.Router();

router.post('/register', registerUserAccount);

export default router;
