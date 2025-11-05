import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import User from '../models/User.js';

const router = express.Router();

const registerSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  })
};

router.post('/register', validate(registerSchema), async (req, res) => {
  const { email, password } = req.validated;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const password_hash = bcrypt.hashSync(password, 10);
  const user = await User.create({ email, password_hash, role: 'admin' });
  return res.json({ id: user._id, email: user.email });
});

const loginSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  })
};

router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.validated;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ sub: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  res.json({ token });
});

export default router;