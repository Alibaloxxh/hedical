"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      autoRaf: true,
      stopInertiaOnNavigate: true,
    });

    return () => lenis.destroy();
  }, []);

  return children;
}
