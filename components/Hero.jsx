// components/Hero.jsx
"use client";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import GlitchText from "./GlitchText";
import NeonButton from "./NeonButton";
import TypewriterText from "./TypewriterText";
import MatrixRain from "./MatrixRain";
import HUDMeters from "./HUDMeters";
import useDevice from "./useDevice";
import useVisible from "./useVisible";
import usePerfMode from "./usePerfMode";

const NeonGrid3D = dynamic(() => import("./NeonGrid3D"), { ssr: false, loading: () => <div style={{height:320}}/> });

export default function Hero() {
  const { isMobile } = useDevice();
  const { low } = usePerfMode();
  const { ref, visible } = useVisible({ rootMargin: "0px 0px -20% 0px", threshold: 0.1 });

  return (
    <section ref={ref} className="relative container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16 sm:pb-24">
      {/* grid 3D: mount solo quando visibile */}
      <div className="absolute inset-x-0 bottom-0 -z-10">
        {visible && <NeonGrid3D height={isMobile ? 260 : 420} autoRotate={!isMobile && !low} />}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative isolate neon-border neon-border-anim bg-black/30 p-4 sm:p-8 rounded-xl crt overflow-visible">

        {/* Layer Matrix confinato nel rettangolo, solo se visibile e non low */}
        <div className="absolute inset-0 rounded-xl overflow-hidden -z-0">
          <MatrixRain opacity={0.12} running={visible && !low} fps={isMobile ? 18 : 24} />
        </div>

        <div className="relative z-10">
          <p className="font-mono text-xs sm:text-sm text-neon-lime/80 animate-flicker">console.log("Ciao da chrif");</p>
          <GlitchText text="Sono chrif." as="h1" className="font-display text-[34px] sm:text-[46px] md:text-[64px] leading-[1.08] neon-text" />
          <h2 className="font-display text-[22px] sm:text-[32px] md:text-[44px] neon-grad animate-glow -mt-1">Esperienze web ad alto voltaggio</h2>
          <div className="mt-2 font-mono text-[11px] sm:text-sm text-cyan-200/80">
            <span className="text-cyan-300/80">status</span>: <TypewriterText phrases={["booting renderer…","syncing pipelines…","deploy complete ✓"]} />
          </div>
          <p className="mt-4 sm:mt-5 text-cyan-100/85 max-w-2xl text-sm sm:text-base">
            Full-stack dev. Performance, design e micro-animazioni. Stack:
            <span className="text-neon-pink"> Next.js</span>, <span className="text-neon-cyan"> Node.js</span>, <span className="text-neon-yellow"> Tailwind</span>.
          </p>
          <div className="mt-6 sm:mt-7 flex flex-wrap gap-3">
            <a href="#projects"><NeonButton className="text-sm sm:text-base px-4 py-2">Vedi Progetti</NeonButton></a>
            <a href="/projects"><NeonButton className="text-sm sm:text-base px-4 py-2">Vedi Tutti</NeonButton></a>
            <a href="/admin"><NeonButton className="text-sm sm:text-base px-4 py-2">Admin</NeonButton></a>
          </div>
          {!low && !isMobile && <HUDMeters />}
        </div>
      </motion.div>
    </section>
  );
}
