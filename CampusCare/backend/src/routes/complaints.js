import { Router } from 'express';

import multer from 'multer';

import {
  createComplaint,
  getComplaint,
  listAllComplaints,
  listMyComplaints,
  updateComplaint,

  // Warden functions
  listWardenComplaints,
  getWardenComplaint,
  updateWardenComplaint,
  escalateWardenComplaint
} from '../controllers/complaints.js';

import {
  requireAuth,
  requireRole,
  requireWarden
} from '../middleware/auth.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024
  },

  fileFilter: (_req, file, cb) =>
    cb(
      null,
      /^image\/(jpeg|png|webp)$/.test(
        file.mimetype
      )
    )
});


// ============================================================
// AUTHENTICATION
// ============================================================

router.use(requireAuth);


// ============================================================
// STUDENT ROUTES
// ============================================================

// Create complaint
router.post(
  '/',
  upload.single('image'),
  createComplaint
);


// Student's own complaints
router.get(
  '/mine',
  listMyComplaints
);


// ============================================================
// WARDEN ROUTES
// IMPORTANT: These must come BEFORE /:id
// ============================================================

// Get all HOSTEL complaints
router.get(
  '/warden',
  requireWarden,
  listWardenComplaints
);


// Get single HOSTEL complaint
router.get(
  '/warden/:id',
  requireWarden,
  getWardenComplaint
);


// Update HOSTEL complaint
router.patch(
  '/warden/:id',
  requireWarden,
  updateWardenComplaint
);


// Escalate HOSTEL complaint -> HOD
router.post(
  '/warden/:id/escalate',
  requireWarden,
  escalateWardenComplaint
);


// ============================================================
// ADMIN ROUTES
// ============================================================

// Admin gets all complaints
router.get(
  '/',
  requireRole('ADMIN'),
  listAllComplaints
);


// ============================================================
// COMMON COMPLAINT DETAIL
// Student -> own complaint
// Admin -> any complaint
// ============================================================

router.get(
  '/:id',
  getComplaint
);


// ============================================================
// ADMIN UPDATE
// ============================================================

router.patch(
  '/:id',
  requireRole('ADMIN'),
  updateComplaint
);


export default router;