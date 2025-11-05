import 'dotenv/config';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './db.js';

import authRoutes from './routes/auth.js';
import siteRoutes from './routes/site.js';
import skillsRoutes from './routes/skills.js';
import projectsRoutes from './routes/projects.js';
import socialRoutes from './routes/social.js';
import contactRoutes from './routes/contact.js';
import exportRoutes from './routes/export.js';
import uploadsRoutes from './routes/uploads.js';

const app = express();

const allowed = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true
}));

app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(limiter);

// Static uploads
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Routes
app.get('/api/health', (_req, res) => res.json({ ok: true, uptime: process.uptime() }));
app.use('/api/auth', authRoutes);
app.use('/api/site', siteRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/social-links', socialRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/uploads', uploadsRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error', details: err.message });
});

const PORT = Number(process.env.PORT || 4000);
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`CHRIF backend (Mongo) running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Errore connessione MongoDB:', err);
  process.exit(1);
});