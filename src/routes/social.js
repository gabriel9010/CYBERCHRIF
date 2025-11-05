import express from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authRequired } from '../middleware/auth.js';
import SocialLink from '../models/SocialLink.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  const rows = await SocialLink.find().sort({ createdAt: -1 });
  res.json(rows);
});

const createSchema = { body: z.object({ platform: z.string().min(1), url: z.string().min(1), icon: z.string().optional() }) };
router.post('/', authRequired, validate(createSchema), async (req, res) => {
  const s = await SocialLink.create(req.validated);
  res.status(201).json(s);
});

const updateSchema = { params: z.object({ id: z.string() }), body: z.object({ platform: z.string().optional(), url: z.string().optional(), icon: z.string().optional() }) };
router.put('/:id', authRequired, validate(updateSchema), async (req, res) => {
  const { id } = req.params;
  const s = await SocialLink.findByIdAndUpdate(id, req.validated, { new: true });
  if (!s) return res.status(404).json({ error: 'Not found' });
  res.json(s);
});

router.delete('/:id', authRequired, async (req, res) => {
  const { id } = req.params;
  await SocialLink.findByIdAndDelete(id);
  res.status(204).end();
});

export default router;