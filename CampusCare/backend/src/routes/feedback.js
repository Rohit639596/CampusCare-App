import express from 'express';

import {
  createFeedback,
  getComplaintFeedback,
} from '../controllers/feedback.js';

import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post(
  '/:complaintId',
  requireAuth,
  createFeedback
);

router.get(
  '/:complaintId',
  requireAuth,
  getComplaintFeedback
);

export default router;