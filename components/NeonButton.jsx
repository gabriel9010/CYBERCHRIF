"use client";
import { useRef } from "react";

export default function NeonButton({ children, className = "", ...props }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    el.style.setProperty("--x", `${x}px`);
    el.style.setProperty("--y", `${y}px`);
  };
  return (
    <button
      ref={ref}
      onMouseMove={onMove}
      className={`relative overflow-hidden btn-neon ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <span
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
        style={{
          left: "var(--x)", top: "var(--y)", width: 160, height: 160,
          background: "radial-gradient(circle, rgba(0,246,255,.35), rgba(255,0,225,0))"
        }}
      />
    </button>
  );
}
