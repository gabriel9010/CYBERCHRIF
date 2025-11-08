"use client";
import { useEffect, useState } from "react";

function IconPicker({ value, onChange }) {
  const opts = ["shield","cpu","globe","code","zap","sparkles","rocket"];
  return (
    <select className="bg-black/40 border border-cyan-500/20 rounded p-2" value={value} onChange={e=>onChange(e.target.value)}>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export default function Admin() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ slug:"", title:"", description:"", tags:"Node.js,Next.js", accent:"#00f6ff", repo:"", demo:"", icon:"globe", image:"" });
  const [err, setErr] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = async () => { const res = await fetch("/api/projects"); const json = await res.json(); setProjects(json.projects); };
  useEffect(() => { load(); }, []);

  const upload = async (file) => {
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setUploading(false);
    if (!res.ok) return alert("Upload fallito");
    const { url } = await res.json(); setForm(f => ({ ...f, image: url }));
  };

 const create = async (e) => {
  e.preventDefault(); setErr("");
  const payload = { ...form, tags: form.tags.split(",").map(s=>s.trim()).filter(Boolean) };

  const res = await fetch("/api/projects", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(payload),
    cache: "no-store" // evita qualsiasi cache proxy
  });

  if (res.ok) {
    // opzionale: reset locale (non serve perché redirigiamo)
    // setForm({ slug:"", title:"", description:"", tags:"", accent:"#00f6ff", repo:"", demo:"", icon:"globe", image:"" });
    // Redirect alla pagina "Tutti i progetti"
    window.location.href = "/projects?created=1";
  } else {
    const msg = await res.json().catch(()=> ({}));
    setErr(msg?.error ? `Errore: ${msg.error}` : "Errore (autorizzazione o dati).");
  }
};


  const del = async (id) => { if (!confirm("Eliminare progetto?")) return; const res = await fetch(`/api/projects/${id}`, { method:"DELETE" }); if (res.ok) load(); };
  const logout = async () => { await fetch("/api/auth/logout",{method:"POST"}); window.location.href="/"; };

  return (
    <div className="container mx-auto px-6 py-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Admin â€” progetti</h1>
        <button className="btn-neon" onClick={logout}>Logout</button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="neon-border rounded-xl p-6 bg-black/30">
          <h2 className="font-display text-xl mb-4">Aggiungi Progetto</h2>
          <form onSubmit={create} className="grid gap-3">
            <input required placeholder="slug" value={form.slug} onChange={e=>setForm(f=>({ ...f, slug:e.target.value }))} className="bg-black/40 rounded p-3 border border-cyan-500/20 focus:border-cyan-400 outline-none" />
            <input required placeholder="title" value={form.title} onChange={e=>setForm(f=>({ ...f, title:e.target.value }))} className="bg-black/40 rounded p-3 border border-cyan-500/20 focus:border-cyan-400 outline-none" />
            <textarea required placeholder="description" value={form.description} onChange={e=>setForm(f=>({ ...f, description:e.target.value }))} rows={3} className="bg-black/40 rounded p-3 border border-cyan-500/20 focus:border-cyan-400 outline-none" />
            <input placeholder="tags (comma)" value={form.tags} onChange={e=>setForm(f=>({ ...f, tags:e.target.value }))} className="bg-black/40 rounded p-3 border border-cyan-500/20 focus:border-cyan-400 outline-none" />
            <div className="flex gap-3 items-center">
              <label className="text-sm">Accent</label>
              <input type="color" value={form.accent} onChange={e=>setForm(f=>({ ...f, accent:e.target.value }))} />
              <IconPicker value={form.icon} onChange={v=>setForm(f=>({ ...f, icon:v }))} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm">Cover (jpg/png)</label>
              <input type="file" accept="image/*" onChange={e=>e.target.files?.[0] && upload(e.target.files[0])} />
              {uploading && <span className="text-xs text-cyan-200/60">Upload...</span>}
              {form.image && <img src={form.image} alt="cover" className="h-28 object-cover rounded border border-cyan-500/20" />}
            </div>
            <input placeholder="repo url" value={form.repo} onChange={e=>setForm(f=>({ ...f, repo:e.target.value }))} className="bg-black/40 rounded p-3 border border-cyan-500/20 focus:border-cyan-400 outline-none" />
            <input placeholder="demo url" value={form.demo} onChange={e=>setForm(f=>({ ...f, demo:e.target.value }))} className="bg-black/40 rounded p-3 border border-cyan-500/20 focus:border-cyan-400 outline-none" />
            <button className="btn-neon w-fit">Crea</button>
            {err && <p className="text-red-400 text-sm">{err}</p>}
          </form>
        </div>

        <div className="neon-border rounded-xl p-6 bg-black/30">
          <h2 className="font-display text-xl mb-4">Lista</h2>
          <div className="grid gap-3">
            {projects.map(p => (
              <div key={p.id} className="border border-cyan-500/20 rounded p-4 flex justify-between items-start">
                <div className="flex gap-3">
                  {p.image ? <img src={p.image} alt="" className="w-20 h-20 object-cover rounded" /> : <div className="w-20 h-20 rounded bg-black/40 border border-cyan-500/20" />}
                  <div>
                    <div className="font-display">{p.title} <span className="text-xs text-cyan-200/60">({p.slug})</span></div>
                    <div className="text-sm text-cyan-100/80">{p.description}</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs">
                      {p.tags.map(t => <span key={t} className="px-2 py-1 rounded border border-cyan-400/30 bg-cyan-400/10">{t}</span>)}
                    </div>
                  </div>
                </div>
                <button className="text-red-300 underline" onClick={()=>del(p.id)}>Elimina</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-cyan-200/60 mt-6">Per accedere: vai a <code>/admin/login</code> (usa <code>ADMIN_PASSWORD</code>).</p>
    </div>
  );
}