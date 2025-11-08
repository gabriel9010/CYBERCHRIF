"use client";
import { useEffect, useRef } from "react";
export default function NeonBackground() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let t = 0, raf;
    const loop = () => {
      t += 0.0025;
      const x = Math.sin(t) * 10, y = Math.cos(t * 0.8) * 10;
      el.style.backgroundPosition = `${x}px ${y}px, ${-x}px ${-y}px`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10"
         style={{
           backgroundImage: `
             radial-gradient(800px 400px at 10% 10%, rgba(255,0,225,.12), transparent 60%),
             radial-gradient(700px 500px at 90% 20%, rgba(0,246,255,.10), transparent 60%)`,
           backgroundColor: "#0b0f17"
         }}>
      <div className="absolute inset-0 bg-grid bg-grid-size-grid opacity-30" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 120%, rgba(138,255,0,.08), transparent 50%)" }} />
    </div>
  );
}