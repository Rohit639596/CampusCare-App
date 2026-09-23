import express from 'express';

import {
  getAdminAnalytics,
} from '../controllers/analytics.js';

import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get(
  '/',
  requireAuth,
  getAdminAnalytics
);

export default router;