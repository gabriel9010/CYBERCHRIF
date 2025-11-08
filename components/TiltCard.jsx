"use client";
import { useRef } from "react";

export default function TiltCard({ children, className = "" }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current; const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (py - 0.5) * 8;   // tilt X
    const ry = (px - 0.5) * -8;  // tilt Y
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
  };
  const onLeave = () => { ref.current.style.transform = ""; };
  return (
    <div ref={ref}
      onMouseMove={onMove} onMouseLeave={onLeave}
      className={`transition-transform duration-200 ${className}`}>
      {children}
    </div>
  );
}
