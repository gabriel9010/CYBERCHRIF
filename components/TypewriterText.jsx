"use client";
import { useEffect, useState } from "react";

export default function TypewriterText({
  phrases = ["booting modules…", "linking microservices…", "deploying shaders…"],
  speed = 40,
  pause = 1200,
  className = ""
}) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [dir, setDir] = useState(1); // 1: typing, -1: deleting

  useEffect(() => {
    let t;
    const run = () => {
      const target = phrases[idx];
      if (dir === 1) {
        setText(prev => {
          const next = target.slice(0, prev.length + 1);
          if (next === target) {
            t = setTimeout(() => setDir(-1), pause);
          } else {
            t = setTimeout(run, speed);
          }
          return next;
        });
      } else {
        setText(prev => {
          const next = prev.slice(0, -1);
          if (next.length === 0) {
            setDir(1);
            setIdx((idx + 1) % phrases.length);
            t = setTimeout(run, speed);
          } else {
            t = setTimeout(run, speed / 1.2);
          }
          return next;
        });
      }
    };
    t = setTimeout(run, 200);
    return () => clearTimeout(t);
  }, [idx, dir, phrases, speed, pause]);

  return (
    <span className={`relative after:content-['▍'] after:ml-1 after:animate-caret ${className}`}>
      {text}
    </span>
  );
}
