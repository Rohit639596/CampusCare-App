import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import complaintRoutes from './routes/complaints.js';
import notificationRoutes from './routes/notifications.js';
import complaintTimelineRoutes from './routes/complaintTimeline.js';
import feedbackRoutes from './routes/feedback.js';
import analyticsRoutes from './routes/analytics.js';


if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) console.warn('DATABASE_URL and JWT_SECRET must be configured.');

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(v => v.trim());
app.use(cors({ origin: (origin, callback) => { if (!origin || allowedOrigins.includes(origin)) return callback(null, true); callback(new Error('CORS origin not allowed')); } }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'CampusCare API' }));
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/complaint-timeline',complaintTimelineRoutes);
app.use('/api/feedback',feedbackRoutes);
app.use('/api/admin/analytics',analyticsRoutes);
app.use((err, req, res, next) => {
  console.error(err);
  if (err?.name === 'ZodError') return res.status(400).json({ message: 'Please check the submitted fields.', errors: err.issues });
  if (err?.code === 'P2002') return res.status(409).json({ message: 'A record with that value already exists.' });
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

const port = Number(process.env.PORT || 5000);
app.listen(port, () => console.log(`CampusCare API running on http://localhost:${port}`));
