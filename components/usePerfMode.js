"use client";
import { useEffect, useState } from "react";

export default function usePerfMode() {
  const [perf, setPerf] = useState({ low: false });
  useEffect(() => {
    const rm = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const cores = navigator.hardwareConcurrency || 2;
    const mem = navigator.deviceMemory || 4;
    const lowPower = rm || cores <= 4 || mem <= 4;
    setPerf({ low: !!lowPower });
  }, []);
  return perf; // { low: boolean }
}
