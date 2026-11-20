'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import Link from '@/components/SiteLink';
import { site, whatsappLink } from '@/lib/site';
import type { StudioMic as Scene } from '@/lib/three/studio-mic';

const steps = [
  { k: 'The studio', t: <>A studio built for <em>the way you create.</em></>, d: 'Acoustically treated, professionally lit and ready for audio or video podcasts.' },
  { k: 'On air', t: <>Hit record. <em>Sound like a pro.</em></>, d: 'Broadcast microphones, clean signal and an engineer on hand — you just talk.' },
  { k: 'Publish-ready', t: <>Every episode, <em>ready to publish.</em></>, d: 'Multi-camera video, editing and mixing support, so your show goes out finished.' },
];

/**
 * (06) The Studio — a pinned 3D studio set: wide shot, the ON AIR sign flickers on,
 * the camera orbits the mic while a level-meter ring dances, then pulls back to the whole set.
 */
export default function StudioStage({ label, idle }: { label: string; idle?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(0);
  const [live, setLive] = useState(false);
  const [state, setState] = useState<'idle' | 'on' | 'off'>('idle');

  useEffect(() => {
    const el = root.current; if (!el) return;
    let scene: Scene | null = null, dead = false, raf = 0, last = -1, started = false, timer = 0, themeOff = () => {};
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)));
      scene?.setProgress(p);
      const s = p < 0.22 ? 0 : p < 0.62 ? 1 : 2;
      if (s !== last) { last = s; setStep(s); }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    const move = (e: PointerEvent) => { if (scene && e.pointerType === 'mouse') scene.setPointer(e.clientX / window.innerWidth * 2 - 1, e.clientY / window.innerHeight * 2 - 1); };
    // build the scene early (while the visitor is still above it) so nothing is compiled mid-scroll
    const start = async () => {
      if (started || dead) return; started = true;
      const { canWebGL } = await import('@/lib/three/stage');
      if (dead) return;
      if (conn?.saveData || !canWebGL() || !canvas.current) { setState('off'); return; }
      try {
        const { mountStudioMic } = await import('@/lib/three/studio-mic');
        if (dead || !canvas.current) return;
        scene = mountStudioMic(canvas.current);
        scene.onLive(v => { if (!dead) setLive(v); });
        const sync = () => scene?.setTheme(document.documentElement.dataset.theme === 'light');
        sync(); window.addEventListener('rk-theme', sync); themeOff = () => window.removeEventListener('rk-theme', sync);
        update();
        await scene.ready;
        if (!dead) setState('on');
      } catch { if (!dead) setState('off'); }
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); start(); } }, { rootMargin: '1800px 0px' });
    io.observe(el);
    if (idle !== false) timer = window.setTimeout(() => { const w = window as Window & { requestIdleCallback?: (cb: () => void) => number }; (w.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1)))(start); }, 3500);
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('pointermove', move, { passive: true });
    return () => { dead = true; themeOff(); clearTimeout(timer); io.disconnect(); cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); window.removeEventListener('pointermove', move); scene?.dispose(); };
  }, [idle]);

  return <section ref={root} className={'pm-se pm-st is-' + state + (live ? ' is-live' : '')} data-dark aria-labelledby="st-title">
    <div className="pm-se-stick">
      <img className="pm-se-fallback" src="/images/academy-studio.webp" alt="" loading="lazy" />
      <span className="pm-st-bg" aria-hidden="true" />
      <canvas ref={canvas} aria-hidden="true" />
      <div className="pm-wrap pm-se-copy">
        <p className="pm-label rule on-dark">{label} — <b>The Studio</b></p>
        <h2 id="st-title" className="pm-se-sr">The RAKVIH Digital podcast studio</h2>
        <div className="pm-se-steps" aria-live="polite">
          {steps.map((s, i) => <div key={s.k} className={'pm-se-step' + (i === step ? ' on' : '')} aria-hidden={i !== step}>
            <p className="pm-se-k"><span className="pm-num">{String(i + 1).padStart(2, '0')}</span> {s.k}{i === 1 && <span className="pm-st-onair"><i />On air</span>}</p>
            <p className="pm-se-t">{s.t}</p>
            <p className="pm-se-d">{s.d}</p>
          </div>)}
        </div>
        <div className="pm-se-dots" aria-hidden="true">{steps.map((s, i) => <i key={s.k} className={i <= step ? 'on' : ''} />)}</div>
        <div className="pm-row on-dark pm-se-cta">
          <Link href="/podcast-studio#enquire" className="pm-btn"><span>Book a slot</span> <ArrowUpRight size={15} /></Link>
          <a href={whatsappLink(`Hello ${site.name}, I’d like to book the podcast studio.`)} target="_blank" rel="noopener noreferrer" className="pm-btn ghost on-dark"><MessageCircle size={15} /> <span>WhatsApp<span className="pm-se-long"> us</span></span></a>
        </div>
      </div>
    </div>
  </section>;
}
