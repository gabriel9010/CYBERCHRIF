"use client";
import { useEffect, useRef } from "react";
import useDevice from "./useDevice";
import usePerfMode from "./usePerfMode";

export default function CursorTrail() {
  const { isMobile } = useDevice();
  const { low } = usePerfMode();
  const canvasRef = useRef(null);

  // disattiva su mobile e in perf-mode
  if (isMobile || low) return null;

  useEffect(() => {
    const cnv = canvasRef.current;
    if (!cnv) return;

    const ctx = cnv.getContext("2d");
    let w = 0, h = 0, raf;
    const points = [];
    const max = 16;

    const resize = () => {
      w = cnv.width = window.innerWidth;
      h = cnv.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const add = (x, y) => {
      points.push({ x, y, life: 1 });
      if (points.length > max) points.shift();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const alpha = p.life * 0.9;
        const size = 5 * p.life + 2;
        ctx.beginPath();
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2);
        grad.addColorStop(0, `rgba(0,246,255,${alpha})`);
        grad.addColorStop(1, `rgba(255,0,225,0)`);
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
        p.life *= 0.92;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    const onMove = (e) => add(e.clientX, e.clientY);
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-40" />;
}
