"use client";
export default function HUDMeters() {
  const bars = [85, 62, 94, 73, 51];
  return (
    <div className="mt-6 grid sm:grid-cols-5 gap-3">
      {bars.map((v, i) => (
        <div key={i} className="bg-black/30 border border-cyan-500/20 rounded-md p-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-cyan-200/70">
            <span>CH{i + 1}</span><span>{v}%</span>
          </div>
          <div className="h-2 mt-1 rounded bg-cyan-500/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-fuchsia-400 via-cyan-300 to-lime-300 animate-meter"
                 style={{ width: `${v}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
