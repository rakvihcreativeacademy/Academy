'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';

declare global { interface Window { __lenis?: Lenis } }

/** Weighted, inertial page scrolling (native scroll position, so sticky + IntersectionObserver keep working). */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ duration: 1.15, easing: t => 1 - Math.pow(1 - t, 4), smoothWheel: true, anchors: { offset: -90 } });
    window.__lenis = lenis;
    let raf = requestAnimationFrame(function loop(t) { lenis.raf(t); raf = requestAnimationFrame(loop); });
    return () => { cancelAnimationFrame(raf); lenis.destroy(); delete window.__lenis; };
  }, []);
  return null;
}
