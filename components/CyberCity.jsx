"use client";
import { motion, useScroll, useTransform } from "framer-motion";

export default function CyberCity() {
  const { scrollYProgress } = useScroll();
  const yBack = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const yMid  = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const yNear = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <div className="relative h-[58vh] min-h-[420px]">
      {/* Gradient sky + glow */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_70%_20%,rgba(255,0,225,.20),transparent_60%),radial-gradient(1000px_600px_at_20%_0%,rgba(0,246,255,.18),transparent_60%)]" />
      <div className="absolute inset-0 animate-bg-pan bg-[length:200%_200%]"
           style={{ backgroundImage: "linear-gradient(90deg, rgba(255,0,225,.12), rgba(0,246,255,.10), rgba(138,255,0,.10))" }} />

      {/* Back skyline */}
      <motion.div style={{ y: yBack }} className="absolute inset-x-0 bottom-16 opacity-60 blur-[0.3px]">
        <CityLayer color="#00f6ff" opacity={0.25} seed={1} />
      </motion.div>

      {/* Mid skyline */}
      <motion.div style={{ y: yMid }} className="absolute inset-x-0 bottom-10 opacity-80">
        <CityLayer color="#ff00e1" opacity={0.35} seed={2} />
      </motion.div>

      {/* Near skyline */}
      <motion.div style={{ y: yNear }} className="absolute inset-x-0 bottom-6">
        <CityLayer color="#8aff00" opacity={0.45} seed={3} />
      </motion.div>

      {/* Neon sun */}
      <div className="absolute right-10 top-10 w-40 h-40 rounded-full"
           style={{ background: "radial-gradient(circle, rgba(255,0,225,.35), rgba(255,0,225,0) 60%)", filter: "blur(10px)" }} />
    </div>
  );
}

function CityLayer({ color = "#00f6ff", opacity = 0.3, seed = 1 }) {
  // semplice skyline parametrico
  const buildings = Array.from({ length: 18 }, (_, i) => {
    const h = 40 + ((i * 23 + seed * 17) % 90);
    const w = 22 + ((i * 11 + seed * 7) % 26);
    return { h, w };
  });
  return (
    <svg viewBox="0 0 1200 200" width="100%" height="140" preserveAspectRatio="none">
      <g filter="url(#glow)">
        {buildings.reduce((acc, b, idx) => {
          const x = acc.x;
          acc.x += b.w + 16;
          acc.elems.push(
            <rect key={idx}
              x={x} y={200 - b.h} width={b.w} height={b.h}
              fill={color} opacity={opacity} rx="2"
            />
          );
          // antenne random
          if (idx % 3 === 0) {
            acc.elems.push(<rect key={`a${idx}`} x={x + b.w/2 - 1} y={200 - b.h - 14} width="2" height="14" fill={color} opacity={opacity * 0.8} />);
          }
          return acc;
        }, { x: 10, elems: [] }).elems}
      </g>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
