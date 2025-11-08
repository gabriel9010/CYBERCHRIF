"use client";

export default function HUDOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-5">
      {/* Corners */}
      <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-cyan-300/50 rounded-tl-md" />
      <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-fuchsia-300/50 rounded-tr-md" />
      <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-lime-300/50 rounded-bl-md" />
      <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-yellow-300/50 rounded-br-md" />

      {/* Reticle */}
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-cyan-300/30"
           style={{ boxShadow: "0 0 22px rgba(0,246,255,.25) inset" }} />
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-300/60" />

      {/* Scanner bar */}
      <div className="pointer-events-none absolute inset-x-0 h-1/3 -translate-y-full animate-scan bg-gradient-to-b from-transparent via-cyan-300/10 to-transparent" />
    </div>
  );
}
