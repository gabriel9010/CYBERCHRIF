"use client";
import { useRef, useState } from "react";

export default function Contact() {
  const [status, setStatus] = useState("idle"); // idle | loading | sent | error
  const [msg, setMsg] = useState(""); // per errori o ID
  const formRef = useRef(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setMsg("");

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: ctrl.signal
      });
      clearTimeout(t);

      if (res.ok) {
        const j = await res.json().catch(() => ({}));
        setStatus("sent");
        formRef.current?.reset();
        const ids = [j.notifyId ? `notify: ${j.notifyId}` : null, j.autoId ? `auto: ${j.autoId}` : null].filter(Boolean).join(" | ");
        setMsg(ids ? `Inviato. ${ids}` : "Inviato ✔️");
      } else {
        const j = await res.json().catch(() => ({}));
        setStatus("error");
        setMsg(j.error || j.warn || "Invio fallito");
      }
    } catch (err) {
      clearTimeout(t);
      setStatus("error");
      setMsg(err?.name === "AbortError" ? "Timeout di rete. Riprova." : "Errore di rete. Riprova.");
    }
  };

  const disabled = status === "loading" || status === "sent";

  return (
    <div className="neon-border rounded-xl p-4 sm:p-8 bg-black/20">
      <h2 className="font-display text-2xl sm:text-3xl mb-3 sm:mb-4">Contattami</h2>

      <form ref={formRef} onSubmit={onSubmit} className="grid gap-3 sm:gap-4" noValidate>
        <input
          required
          name="name"
          placeholder="Nome"
          autoComplete="name"
          disabled={disabled}
          className="bg-black/40 rounded p-3 sm:p-3.5 text-sm sm:text-base border border-cyan-500/20 focus:border-cyan-400 outline-none"
        />
        <input
          required
          type="email"
          name="email"
          placeholder="Email"
          autoComplete="email"
          disabled={disabled}
          className="bg-black/40 rounded p-3 sm:p-3.5 text-sm sm:text-base border border-cyan-500/20 focus:border-cyan-400 outline-none"
        />
        <textarea
          required
          name="message"
          placeholder="Messaggio"
          rows={5}
          disabled={disabled}
          className="bg-black/40 rounded p-3 sm:p-3.5 text-sm sm:text-base border border-cyan-500/20 focus:border-cyan-400 outline-none"
        />

        <button className="btn-neon w-full sm:w-fit text-sm sm:text-base" disabled={disabled} aria-live="polite">
          {status === "loading" ? "Invio..." : status === "sent" ? "Inviato ✔️" : "Invia"}
        </button>

        <div aria-live="polite" className="min-h-[1.25rem]">
          {msg && (
            <p className={status === "error" ? "text-sm text-red-400" : "text-sm text-green-300"}>
              {msg}
            </p>
          )}
        </div>
      </form>

      <p className="text-xs text-cyan-200/60 mt-3">
        Configura <code>RESEND_API_KEY</code>, <code>RESEND_FROM</code>, <code>RESEND_TO</code> in <code>.env.local</code>.
        {process.env.NEXT_PUBLIC_EMAIL_LITE ? null : null}
      </p>
    </div>
  );
}
