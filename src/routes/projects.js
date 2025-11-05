import express from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authRequired } from '../middleware/auth.js';
import Project from '../models/Project.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  const rows = await Project.find().sort({ createdAt: -1 });
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const row = await Project.findById(id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

const projectSchema = {
  body: z.object({
    title: z.string().min(1),
    tagline: z.string().optional(),
    brief_description: z.string().optional(),
    full_description: z.string().optional(),
    category: z.string().optional(),
    status: z.string().optional(),
    technologies: z.array(z.string()).optional(),
    tools: z.string().optional(),
    live_url: z.string().optional(),
    github_url: z.string().optional(),
    demo_url: z.string().optional(),
    client_name: z.string().optional(),
    role: z.string().optional(),
    team_size: z.string().optional(),
    duration: z.string().optional(),
    challenges: z.string().optional(),
    solutions: z.string().optional(),
    results: z.string().optional(),
    mainImage: z.string().optional(),
    galleryImages: z.array(z.string()).optional(),
    video_url: z.string().optional(),
    featured: z.boolean().optional(),
    visible: z.boolean().optional(),
    link: z.string().optional(),
    image: z.string().optional()
  })
};

router.post('/', authRequired, validate(projectSchema), async (req, res) => {
  const p = await Project.create(req.validated);
  res.status(201).json(p);
});

router.put('/:id', authRequired, validate(projectSchema), async (req, res) => {
  const { id } = req.params;
  const p = await Project.findByIdAndUpdate(id, req.validated, { new: true });
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

router.delete('/:id', authRequired, async (req, res) => {
  const { id } = req.params;
  await Project.findByIdAndDelete(id);
  res.status(204).end();
});

export default router;