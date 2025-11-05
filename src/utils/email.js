import nodemailer from 'nodemailer';

export async function sendMail({ subject, text, html }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM, MAIL_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !MAIL_TO) {
    return { sent: false, reason: 'Email transport not configured' };
  }
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: String(SMTP_SECURE || 'false') === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
  const info = await transporter.sendMail({
    from: MAIL_FROM || 'no-reply@example.com',
    to: MAIL_TO,
    subject,
    text,
    html
  });
  return { sent: true, messageId: info.messageId };
}