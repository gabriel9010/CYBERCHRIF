"use client";
import { useEffect, useRef } from "react";

export default function MatrixRain({ opacity = 0.1, running = true, fps = 24 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    const ctx = canvas.getContext("2d", { alpha: true });

    let w = 0, h = 0, cols = 0, drops = [];
    let raf, last = 0, frameInterval = 1000 / fps;

    const letters = "アカサタナハマヤラワ0123456789$#&@≡∑µλΓΩπ";

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = parent.clientWidth;
      const cssH = parent.clientHeight;
      canvas.style.width = cssW + "px";
      canvas.style.height = cssH + "px";
      canvas.width = Math.max(1, Math.floor(cssW * dpr));
      canvas.height = Math.max(1, Math.floor(cssH * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      w = cssW; h = cssH;
      cols = Math.max(1, Math.floor(w / 16));
      drops = Array(cols).fill(0);
      ctx.font = "14px monospace";
      ctx.textBaseline = "top";
      ctx.shadowBlur = 8;
    };

    const tick = (now) => {
      if (!running || document.hidden) { raf = requestAnimationFrame(tick); return; }
      if (now - last < frameInterval) { raf = requestAnimationFrame(tick); return; }
      last = now;

      // dissolve senza annerire
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = `rgba(0,0,0,${1 - opacity})`;
      ctx.fillRect(0, 0, w, h);

      // additivo
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = "rgba(0,246,255,0.55)";
      ctx.shadowColor = "rgba(255,0,225,0.45)";

      for (let i = 0; i < drops.length; i++) {
        const ch = letters[(Math.random() * letters.length) | 0];
        const x = i * 16;
        const y = drops[i] * 16;
        ctx.fillText(ch, x, y);
        if (y > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      raf = requestAnimationFrame(tick);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    resize();
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [opacity, running, fps]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ mixBlendMode: "screen", borderRadius: "inherit" }}
      aria-hidden
    />
  );
}
