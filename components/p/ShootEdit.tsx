'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import Link from '@/components/SiteLink';
import type { ShootEdit as Scene } from '@/lib/three/shoot-edit';

const steps = [
  { k: 'Cinematography', t: <>Capture it <em>like cinema.</em></>, d: 'Camera handling, framing, lighting and movement — on professional cinema gear.' },
  { k: 'From the set', t: <>Every frame, <em>into the edit.</em></>, d: 'Your footage moves straight into an industry editing workflow — organised, synced and ready to cut.' },
  { k: 'Video editing', t: <>Cut it into <em>a story.</em></>, d: 'Timing, transitions, sound and colour grading — until it plays like a finished film.' },
];

/**
 * (03) Shoot & Edit — a pinned scroll story: a cine camera records, its frames fly onto an
 * editing timeline, and the cut plays on a monitor. Falls back to a still image without WebGL.
 */
export default function ShootEdit({ label, variant = 'courses' }: { label: string; variant?: 'courses' | 'production' }) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [step, setStep] = useState(0);
  const [state, setState] = useState<'idle' | 'on' | 'off'>('idle');

  useEffect(() => {
    const el = root.current; if (!el) return;
    let scene: Scene | null = null, dead = false, raf = 0, last = -1, vp = 0, vraf = 0, vOn = false;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)));
      scene?.setProgress(p);
      vp = p;
      // the sky behind the set drifts with the scroll: a slow zoom-out and a little rise
      const v = video.current;
      if (v) v.style.transform = `translate3d(0, ${(-p * 4).toFixed(2)}%, 0) scale(${(1.22 - p * 0.14).toFixed(4)})`;
      const s = p < 0.3 ? 0 : p < 0.66 ? 1 : 2;
      // the night sky dims while the camera shoots and the edit plays, then returns
      const sm = (v: number) => { v = Math.min(1, Math.max(0, v)); return v * v * (3 - 2 * v); };
      el.style.setProperty('--dim', (sm((p - 0.12) / 0.1) * (1 - sm((p - 0.9) / 0.07))).toFixed(3));
      if (s !== last) { last = s; setStep(s); }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    // scroll-scrubbed video: ease the playhead towards the scroll position (short GOP keeps seeks cheap)
    const scrub = () => {
      vraf = 0;
      const v = video.current; if (!v || !vOn || dead) return;
      if (v.readyState >= 1 && v.duration && !v.seeking) {
        const target = vp * (v.duration - 0.05), cur = v.currentTime, d = target - cur;
        if (Math.abs(d) > 0.02) v.currentTime = cur + d * 0.22;
      }
      vraf = requestAnimationFrame(scrub);
    };
    // prepare the video decoder in idle time (setting it up takes a few hundred ms on some GPUs)
    const prime = () => { const v = video.current; if (!v || v.src || dead) return; v.src = v.dataset.src || ''; v.load(); v.play().then(() => v.pause()).catch(() => {}); };
    const vio = new IntersectionObserver(([e]) => {
      vOn = e.isIntersecting;
      if (vOn) { prime(); if (!vraf) vraf = requestAnimationFrame(scrub); }
    }, { rootMargin: '1800px 0px' });
    const vtimer = window.setTimeout(() => { const w = window as Window & { requestIdleCallback?: (cb: () => void) => number }; (w.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1)))(prime); }, 4500);
    if (video.current) vio.observe(video.current);
    const move = (e: PointerEvent) => { if (scene && e.pointerType === 'mouse') scene.setPointer(e.clientX / window.innerWidth * 2 - 1, e.clientY / window.innerHeight * 2 - 1); };
    // build the scene early (while the visitor is still above it) so nothing is compiled mid-scroll
    let started = false;
    const start = async () => {
      if (started || dead) return; started = true;
      const { canWebGL } = await import('@/lib/three/stage');
      if (dead) return;
      if (conn?.saveData || !canWebGL() || !canvas.current) { setState('off'); return; }
      try {
        const { mountShootEdit } = await import('@/lib/three/shoot-edit');
        if (dead || !canvas.current) return;
        scene = mountShootEdit(canvas.current);
        update();
        await scene.ready;
        if (!dead) setState('on');
      } catch { if (!dead) setState('off'); }
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); start(); } }, { rootMargin: '1800px 0px' });
    const timer = window.setTimeout(() => { const w = window as Window & { requestIdleCallback?: (cb: () => void) => number }; (w.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1)))(start); }, 2200);
    io.observe(el);
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('pointermove', move, { passive: true });
    return () => { dead = true; clearTimeout(timer); clearTimeout(vtimer); io.disconnect(); vio.disconnect(); cancelAnimationFrame(raf); cancelAnimationFrame(vraf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); window.removeEventListener('pointermove', move); scene?.dispose(); };
  }, []);

  return <section ref={root} className={'pm-se is-' + state} data-dark aria-labelledby="se-title">
    <div className="pm-se-stick">
      <video ref={video} className="pm-se-video" data-src="/video/cosmos.mp4" poster="/video/cosmos-poster.jpg" muted playsInline preload="none" aria-hidden="true" tabIndex={-1} />
      <span className="pm-se-veil" aria-hidden="true" />
      <span className="pm-se-glow" aria-hidden="true" />
      <img className="pm-se-fallback" src="/images/course-cinematography.webp" alt="" loading="lazy" />
      <canvas ref={canvas} aria-hidden="true" />
      <div className="pm-wrap pm-se-copy">
        <p className="pm-label rule on-dark">{label} — <b>Shoot &amp; Edit</b></p>
        <h2 id="se-title" className="pm-se-sr">Cinematography and video editing at RAKVIH Digital</h2>
        <div className="pm-se-steps" aria-live="polite">
          {steps.map((s, i) => <div key={s.k} className={'pm-se-step' + (i === step ? ' on' : '')} aria-hidden={i !== step}>
            <p className="pm-se-k"><span className="pm-num">{String(i + 1).padStart(2, '0')}</span> {s.k}</p>
            <p className="pm-se-t">{s.t}</p>
            <p className="pm-se-d">{s.d}</p>
          </div>)}
        </div>
        <div className="pm-se-dots" aria-hidden="true">{steps.map((s, i) => <i key={s.k} className={i <= step ? 'on' : ''} />)}</div>
        <div className="pm-row on-dark pm-se-cta">
          {variant === 'production' ? <>
            <Link href="/production#enquire" className="pm-btn"><span>Start a project</span> <ArrowUpRight size={15} /></Link>
            <Link href="/courses#cinematography" className="pm-btn ghost on-dark"><span>Learn it<span className="pm-se-long"> yourself</span></span></Link>
          </> : <>
            <Link href="/courses#cinematography" className="pm-btn"><span>Cinematography<span className="pm-se-long"> course</span></span> <ArrowUpRight size={15} /></Link>
            <Link href="/courses#video-editing" className="pm-btn ghost on-dark"><span>Video editing<span className="pm-se-long"> course</span></span></Link>
          </>}
        </div>
      </div>
    </div>
  </section>;
}
