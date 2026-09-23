import express from 'express';

import {
  getComplaintTimeline,
} from '../controllers/complaintTimeline.js';

import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get(
  '/:id',
  requireAuth,
  getComplaintTimeline
);

export default router;