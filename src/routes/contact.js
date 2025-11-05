import express from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { sendMail } from '../utils/email.js';
import Message from '../models/Message.js';

const router = express.Router();

const schema = { body: z.object({ name: z.string().min(1), email: z.string().email(), message: z.string().min(1) }) };

router.post('/', validate(schema), async (req, res) => {
  const { name, email, message } = req.validated;
  const saved = await Message.create({ name, email, message });
  let emailResult = { sent: false };
  try {
    emailResult = await sendMail({
      subject: "Nuovo messaggio dal portfolio",
      text: `Da: ${name} <${email}>\n\n${message}`,
      html: `<p><strong>Da:</strong> ${name} &lt;${email}&gt;</p><p>${message}</p>`
    });
  } catch (_) {}
  res.status(201).json({ id: saved._id, stored: true, email: emailResult });
});

export default router;