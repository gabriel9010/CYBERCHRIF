import express from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authRequired } from '../middleware/auth.js';
import SiteInfo from '../models/SiteInfo.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  const doc = await SiteInfo.getSingleton();
  res.json(doc);
});

const updateSchema = {
  body: z.object({
    name: z.string().min(1).optional(),
    tagline: z.string().optional(),
    email: z.string().email().optional(),
    bio: z.string().optional()
  })
};

router.put('/', authRequired, validate(updateSchema), async (req, res) => {
  const doc = await SiteInfo.getSingleton();
  Object.assign(doc, req.validated);
  await doc.save();
  res.json(doc);
});

export default router;