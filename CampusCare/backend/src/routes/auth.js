import { Router } from 'express';

import {
  register,
  adminRegister,
  login,
  adminLogin,
  studentForgotPassword,
  adminForgotPassword,
  studentResetPassword,
  adminResetPassword,
  me
} from '../controllers/auth.js';

import { requireAuth } from '../middleware/auth.js';

const router = Router();


// Student
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', studentForgotPassword);
router.post('/reset-password', studentResetPassword);


// Admin
router.post('/admin/register', adminRegister);
router.post('/admin/login', adminLogin);
router.post('/admin/forgot-password', adminForgotPassword);
router.post('/admin/reset-password', adminResetPassword);


// Current user
router.get('/me', requireAuth, me);

export default router;