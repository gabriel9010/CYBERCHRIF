"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import TiltCard from "./TiltCard";
import { Cpu, Shield, Globe, Code2, Zap, Sparkles, Rocket } from "lucide-react";
const ICONS = { cpu: Cpu, shield: Shield, globe: Globe, code: Code2, zap: Zap, sparkles: Sparkles, rocket: Rocket };

export default function Projects({ limit, title = "Progetti in evidenza", showCTA = true, initialProjects = [] }) {
  const [projects, setProjects] = useState(initialProjects);
  useEffect(() => {
    if (initialProjects.length) return; // già idratato dal server
    (async () => {
      const res = await fetch("/api/projects", { cache: "no-store" });
      const json = await res.json(); setProjects(json.projects);
    })();
  }, [initialProjects]);

  const visible = typeof limit === "number" ? projects.slice(0, limit) : projects;

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl sm:text-3xl neon-text">{title}</h2>
        {typeof limit === "number" && showCTA && projects.length > limit ? (
          <a href="/projects" className="link-neon font-mono text-xs sm:text-sm">Vedi tutti →</a>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {visible.map((p) => {
          const Icon = ICONS[p.icon] ?? Globe;
          return (
            <TiltCard key={p.id} className="neon-border hover:shadow-neon-strong">
              <article className="rounded-lg p-4 sm:p-5 bg-black/25 hover:bg-black/35 transition group">
                <div className="relative aspect-[16/9] w-full mb-3 sm:mb-4 rounded-md overflow-hidden bg-black/30">
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={false}
                      loading="lazy"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-5xl sm:text-6xl">
                      <Icon size={48} />
                    </div>
                  )}
                </div>
                <h3 className="font-display text-lg sm:text-xl mb-2 neon-text">{p.title}</h3>
                <p className="text-[13px] sm:text-sm text-cyan-100/85 mb-3 sm:mb-4">{p.description}</p>
                <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono flex-wrap">
                  {p.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 rounded border border-cyan-400/30 bg-cyan-400/10">{tag}</span>
                  ))}
                </div>
                <div className="mt-3 sm:mt-4 flex gap-4">
                  {p.demo ? <a className="link-neon text-xs sm:text-sm" href={p.demo} target="_blank" rel="noreferrer">Live</a> : null}
                  {p.repo ? <a className="link-neon text-xs sm:text-sm" href={p.repo} target="_blank" rel="noreferrer">Repo</a> : null}
                </div>
              </article>
            </TiltCard>
          );
        })}
      </div>
    </div>
  );
}
