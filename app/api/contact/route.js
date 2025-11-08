// app/api/contact/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from "node:crypto";

/** ===== Config =====
 * EMAIL_TARGET = "user"   -> invia 1 sola email al mittente (auto-reply)
 * EMAIL_TARGET = "notify" -> invia 1 sola email a RESEND_TO (notifica)
 */
const EMAIL_TARGET = (process.env.EMAIL_TARGET || "user").toLowerCase(); // default: user

/* ====== STILE "NEON GRID CARD" ====== */
const CSS = `
:root { color-scheme: dark; }
html,body{margin:0!important;padding:0!important;height:100%!important;width:100%!important}
*{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}
table,td{mso-table-lspace:0pt!important;mso-table-rspace:0pt!important;border-collapse:collapse}
img{border:0;outline:none;text-decoration:none;display:block;-ms-interpolation-mode:bicubic}
a{text-decoration:none}
a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}
div[style*="margin: 16px 0"]{margin:0!important}
body{background:#0b0f17;color:#e6f1ff;font-family:Arial,Helvetica,sans-serif}
.container{width:100%!important;background:#0b0f17;padding:28px 0}
.card{width:100%;max-width:680px;margin:0 auto;border-radius:18px;overflow:hidden;background:#0e1320;border:1px solid rgba(0,246,255,.20);
  box-shadow:0 0 0 1px rgba(0,246,255,.10) inset,0 18px 40px rgba(0,246,255,.08),0 0 22px rgba(0,246,255,.15);position:relative;}
.grid{background-image:linear-gradient(rgba(0,246,255,.08) 1px, transparent 1px),linear-gradient(90deg, rgba(0,246,255,.08) 1px, transparent 1px);background-size:44px 44px;}
.header{padding:26px 26px 18px 26px;background:radial-gradient(600px 260px at 0% 0%, rgba(0,246,255,.22), transparent 60%),radial-gradient(600px 260px at 45% -10%, rgba(255,0,225,.18), transparent 60%);border-bottom:1px solid rgba(0,246,255,.22);}
.brand{font-weight:800;letter-spacing:.5px;font-size:22px;color:#e8f6ff;}
.pill{display:inline-block;margin-top:10px;padding:6px 10px;border-radius:10px;font-size:12px;font-family:Consolas,Menlo,monospace;color:#bfefff;background:rgba(0,246,255,.10);border:1px solid rgba(0,246,255,.35);}
.content{padding:26px;}
.h1{font-size:28px;margin:0 0 12px 0;color:#eaf6ff;}
.p{font-size:15px;line-height:1.7;color:#d9f4ff;margin:0 0 8px 0;}
.rule{height:1px;margin:22px 0 14px 0;background:linear-gradient(90deg, rgba(255,0,225,.35), rgba(0,246,255,.35));}
.msg{margin:12px 0;padding:12px;border-radius:10px;background:#0b111c;border:1px solid rgba(0,246,255,.25);color:#dffbff;font-family:Consolas,Menlo,monospace;white-space:pre-wrap;word-break:break-word;}
.footer{padding:20px;text-align:center;font-size:12px;color:#9cc9cf;}
@media only screen and (max-width:640px){.header{padding:20px 18px 14px 18px}.content{padding:18px}.h1{font-size:24px}.p{font-size:16px}}
`;

function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function wrapDoc(title, inner) {
  return `<!doctype html><html><head>
    <meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
    <title>${title}</title><style>${CSS}</style></head>
  <body>
    <table role="presentation" class="container" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <table role="presentation" class="card grid" width="100%" cellpadding="0" cellspacing="0">
          ${inner}
        </table>
      </td></tr>
    </table>
  </body></html>`;
}

/* ------- Templates ------- */
function htmlNotify({ name, email, message }) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMsg = escapeHtml(message);
  const inner = `
    <tr><td class="header">
      <div class="brand">&lt;chrif/&gt;</div>
      <div><span class="pill">NEW MESSAGE</span></div>
    </td></tr>
    <tr><td class="content">
      <h1 class="h1">Nuovo messaggio</h1>
      <div class="msg">${safeMsg}</div>
      <div class="rule"></div>
      <p class="p"><strong>Da:</strong> ${safeName} &lt;<a href="mailto:${safeEmail}">${safeEmail}</a>&gt;</p>
    </td></tr>
    <tr><td class="footer">chrif — Cyberpunk Portfolio</td></tr>
  `;
  return wrapDoc("chrif — Nuovo messaggio", inner);
}

function htmlAuto(name, message) {
  const safeName = escapeHtml(name || "ciao");
  const safeMsg = escapeHtml(message || "");
  const inner = `
    <tr><td class="header">
      <div class="brand">&lt;chrif/&gt;</div>
      <div><span class="pill">AUTO-REPLY</span></div>
    </td></tr>
    <tr><td class="content">
      <h1 class="h1">Ciao ${safeName} 👋</h1>
      <p class="p">Grazie! Ho ricevuto il tuo messaggio e ti risponderò al più presto.</p>
      ${safeMsg ? `
        <div class="rule"></div>
        <p class="p">Il tuo messaggio:</p>
        <div class="msg">${safeMsg}</div>` : ``}
    </td></tr>
    <tr><td class="footer">chrif — Cyberpunk Portfolio</td></tr>
  `;
  return wrapDoc("chrif — Conferma messaggio", inner);
}

/* --------- Idempotenza / anti-duplicati (15s) --------- */
const recent = new Map(); // key -> timestamp ms
function makeKey(reqId, body) {
  if (reqId) return `id:${reqId}`;
  const base = `${(body.email||"").toLowerCase()}|${body.name||""}|${body.message||""}`;
  return crypto.createHash("sha1").update(base).digest("hex");
}
function seenRecently(key, windowMs = 15_000) {
  const now = Date.now();
  const last = recent.get(key) || 0;
  recent.set(key, now);
  for (const [k,t] of recent) if (now - t > 60_000) recent.delete(k);
  return now - last < windowMs;
}

/* ------------------ Handler ------------------ */
export async function POST(req) {
  try {
    if (!req.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json({ error: "Bad content-type" }, { status: 415 });
    }

    const body = await req.json();
    const { name, email, message } = body || {};
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { RESEND_API_KEY, RESEND_FROM, RESEND_TO } = process.env;
    if (!RESEND_API_KEY || !RESEND_FROM) {
      return NextResponse.json({ error: "Email not configured" }, { status: 500 });
    }
    if (EMAIL_TARGET === "notify" && !RESEND_TO) {
      return NextResponse.json({ error: "RESEND_TO missing (EMAIL_TARGET=notify)" }, { status: 500 });
    }

    // idempotency
    const key = makeKey(req.headers.get("x-idempotency-key"), body);
    if (seenRecently(key)) {
      return NextResponse.json({ ok: true, dedup: true });
    }

    const resend = new Resend(RESEND_API_KEY);

    if (EMAIL_TARGET === "user") {
      // ✅ invia SOLO al mittente (conferma)
      const r = await resend.emails.send({
        from: RESEND_FROM,            // es. 'Portfolio <hello@tuodominio.it>' (dominio verificato)
        to: email,                    // mittente
        subject: "Conferma ricezione — chrif",
        html: htmlAuto(name, message),
        text: `Ciao ${name}, ho ricevuto il tuo messaggio:\n\n${message}\n\n— chrif`
      });
      if (r?.error) return NextResponse.json({ error: "Invio fallito" }, { status: 502 });
      return NextResponse.json({ ok: true });
    } else {
      // ✅ invia SOLO a te (notifica)
      const r = await resend.emails.send({
        from: RESEND_FROM,
        to: RESEND_TO,
        reply_to: email,
        subject: `Nuovo messaggio — ${name}`,
        html: htmlNotify({ name, email, message }),
        text: `Nuovo messaggio da ${name} <${email}>\n\n${message}\n\n— chrif`
      });
      if (r?.error) return NextResponse.json({ error: "Invio fallito" }, { status: 502 });
      return NextResponse.json({ ok: true });
    }
  } catch (e) {
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}
