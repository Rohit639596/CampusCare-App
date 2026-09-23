import express from 'express';

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../controllers/notifications.js';

import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get(
  '/',
  requireAuth,
  getMyNotifications
);

router.patch(
  '/read-all',
  requireAuth,
  markAllNotificationsAsRead
);

router.patch(
  '/:id/read',
  requireAuth,
  markNotificationAsRead
);

export default router;