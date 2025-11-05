import express from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authRequired } from '../middleware/auth.js';
import Skill from '../models/Skill.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  const rows = await Skill.find().sort({ createdAt: -1 });
  res.json(rows);
});

const createSchema = { body: z.object({ name: z.string().min(1), level: z.number().int().min(0).max(100) }) };
router.post('/', authRequired, validate(createSchema), async (req, res) => {
  const { name, level } = req.validated;
  const s = await Skill.create({ name, level });
  res.status(201).json(s);
});

const updateSchema = { params: z.object({ id: z.string() }), body: z.object({ name: z.string().min(1).optional(), level: z.number().int().min(0).max(100).optional() }) };
router.put('/:id', authRequired, validate(updateSchema), async (req, res) => {
  const { id } = req.params;
  const s = await Skill.findByIdAndUpdate(id, req.validated, { new: true });
  if (!s) return res.status(404).json({ error: 'Not found' });
  res.json(s);
});

router.delete('/:id', authRequired, async (req, res) => {
  const { id } = req.params;
  await Skill.findByIdAndDelete(id);
  res.status(204).end();
});

export default router;