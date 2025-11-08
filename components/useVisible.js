"use client";
import { useEffect, useRef, useState } from "react";

export default function useVisible(options = { rootMargin: "0px 0px -20% 0px", threshold: 0.1 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), options);
    io.observe(el);
    return () => io.disconnect();
  }, [options.rootMargin, options.threshold]);
  return { ref, visible };
}
