import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

export default function SmoothScroll({ children }) {
  useEffect(() => {
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      lerp: 0,
      duration: 3,
      duration: 1.5,
      smooth: true,
    });

    // Exposed so in-page anchor navigation (e.g. the project detail section
    // nav) can scroll through Lenis instead of fighting it with native
    // `scrollIntoView`, which Lenis overrides.
    window.__lenis = lenis;

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      if (window.__lenis === lenis) delete window.__lenis;
    };
  }, []);

  return children;
}
