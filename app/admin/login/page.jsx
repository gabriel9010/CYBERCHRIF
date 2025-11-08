"use client";
import { useState } from "react";
export default function Login() {
  const [err, setErr] = useState("");
  const onSubmit = async (e) => {
    e.preventDefault(); setErr("");
    const pwd = new FormData(e.currentTarget).get("password");
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ password: pwd }) });
    if (res.ok) window.location.href = "/admin"; else setErr("Password errata âŒ");
  };
  return (
    <div className="container mx-auto px-6 py-28 max-w-md">
      <div className="neon-border rounded-xl p-8 bg-black/30">
        <h1 className="font-display text-3xl mb-4">Login Admin</h1>
        <form onSubmit={onSubmit} className="grid gap-4">
          <input type="password" name="password" placeholder="Password" className="bg-black/40 rounded p-3 border border-cyan-500/20 focus:border-cyan-400 outline-none" />
          <button className="btn-neon w-fit">Entra</button>
          {err && <p className="text-red-400 text-sm">{err}</p>}
        </form>
      </div>
    </div>
  );
}