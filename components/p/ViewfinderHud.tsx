'use client';
import { useEffect, useRef } from 'react';

/**
 * Camera-viewfinder overlay for inner-page banners: corner brackets, blinking REC with a running
 * timecode, scene/take slate, battery, exposure readout, a focus box that "racks focus" on load and a
 * faint rule-of-thirds grid. As the banner scrolls away it pulls back into a rounded frame.
 */
export default function ViewfinderHud({ scene, take = '01', exposure = 'ISO 800 · f/2.8 · 1/50' }: { scene: string; take?: string; exposure?: string }) {
  const hud = useRef<HTMLDivElement>(null);
  const tc = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = hud.current, banner = el?.closest('.pm-banner') as HTMLElement | null;
    if (!el || !banner) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t0 = performance.now();
    let raf = 0, on = true;
    const tick = () => {
      const s = (performance.now() - t0) / 1000, f = Math.floor((s % 1) * 24);
      if (tc.current) tc.current.textContent = `00:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(Math.floor(s) % 60).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
    };
    const id = window.setInterval(() => { if (on) tick(); }, 1000 / 12);
    // pull-back: 0 at rest → 1 once the banner has scrolled out
    const update = () => {
      raf = 0;
      const r = banner.getBoundingClientRect();
      on = r.bottom > 0;
      if (reduce) return;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
      banner.style.setProperty('--vf', p.toFixed(4));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { clearInterval(id); cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  return <div className="pm-vfx" ref={hud} aria-hidden="true">
    <i className="pm-vfx-grid" />
    <i className="pm-vfx-c tl" /><i className="pm-vfx-c tr" /><i className="pm-vfx-c bl" /><i className="pm-vfx-c br" />
    <div className="pm-vfx-top">
      <span className="pm-vfx-rec"><b />REC<span ref={tc} className="pm-vfx-tc">00:00:00:00</span></span>
      <span className="pm-vfx-slate">SC {scene} · TK {take}<i className="pm-vfx-bat"><b /></i></span>
    </div>
    <i className="pm-vfx-focus"><b /><b /><b /><b /></i>
    <div className="pm-vfx-bottom"><span>{exposure}</span><span>4K · 24 FPS</span></div>
  </div>;
}
