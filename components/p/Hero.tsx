'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import Link from '@/components/SiteLink';
import { site } from '@/lib/site';

const plates = [
  { src: '/images/academy-filmmaking.webp', title: 'Filmmaking' },
  { src: '/images/academy-photography.webp', title: 'Photography' },
  { src: '/images/academy-editing.webp', title: 'Editing' },
  { src: '/images/academy-studio.webp', title: 'Podcast studio' },
];
const HOLD = 5200;
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Two-act scroll hero, driven only by transforms + opacity (compositor-friendly, no repaint per frame).
 * Act I  — the campaign words sit above and below a framed photograph.
 * Act II — the frame scales up to full bleed; the tagline and CTAs arrive.
 * Below 900px (or with reduced motion) it is a static, stacked composition.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const win = useRef<HTMLDivElement>(null);
  const words = useRef<HTMLParagraphElement>(null);
  const act = useRef<HTMLDivElement>(null);
  const meta = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const [act2, setAct2] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setTimeout(() => setI(n => (n + 1) % plates.length), HOLD);
    return () => clearTimeout(t);
  }, [i]);

  useEffect(() => {
    const el = root.current; if (!el) return;
    const mq = window.matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)');
    let raf = 0, was = false;
    const reset = () => { [win, words, act, meta].forEach(r => r.current?.removeAttribute('style')); Array.from(words.current?.children ?? []).forEach(s => s.removeAttribute('style')); };
    const update = () => {
      raf = 0;
      if (!mq.matches) { reset(); if (!was) { was = true; setAct2(true); } return; }
      const r = el.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height - window.innerHeight));
      const e1 = ease(clamp(p / .6)), e2 = clamp((p - .48) / .3);
      const s = .44 + .56 * e1;
      if (win.current) { win.current.style.transform = `scale(${s.toFixed(4)})`; win.current.style.borderRadius = `${((1 - e1) * 20 / s).toFixed(2)}px`; win.current.style.setProperty('--sh', e2.toFixed(3)); }
      if (words.current) {
        const sp = words.current.children;
        const dx = e1 * 14, dy = e1 * 12, o = String(Math.max(0, 1 - e1 * 1.3));
        const set = (n: number, x: number, y: number) => { const w = sp[n] as HTMLElement | undefined; if (w) { w.style.transform = `translate3d(${x}vw, ${y}vh, 0)`; w.style.opacity = o; } };
        set(0, -dx, -dy); set(1, dx, -dy); set(2, -dx, dy); set(3, dx, dy);
      }
      if (meta.current) meta.current.style.opacity = String(Math.max(0, 1 - e1 * 2));
      if (act.current) { act.current.style.opacity = e2.toFixed(3); act.current.style.transform = `translate3d(0, ${((1 - e2) * 50).toFixed(1)}px, 0)`; }
      const on = e2 > .4;
      if (on !== was) { was = on; setAct2(on); }
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    mq.addEventListener('change', on);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on); window.removeEventListener('resize', on); mq.removeEventListener('change', on); };
  }, []);

  return <section ref={root} className={'pm-hx' + (act2 ? ' act2' : '')} data-hero data-dark>
    <div className="pm-hx-stick">
      <div className="pm-hx-meta" ref={meta} aria-hidden="true">
        <span>RAKVIH Digital</span>
        <span className="mid">Bengaluru, India</span>
        <span>Editing · Cinema · Photo · Design</span>
      </div>

      <div className="pm-hx-win" ref={win}>
        {plates.map((p, n) => <img key={p.src} src={p.src} alt="" className={n === i ? 'on' : ''} fetchPriority={n === 0 ? 'high' : 'low'} loading={n === 0 ? 'eager' : 'lazy'} decoding="async" />)}
        <span className="pm-hx-shade" />
      </div>

      <p className="pm-hx-words" ref={words} aria-label={site.campaign}>
        <span className="w1"><span>Create.</span></span><span className="w2"><span><em>Capture.</em></span></span>
        <span className="w3"><span><em>Edit.</em></span></span><span className="w4"><span>Inspire.</span></span>
      </p>

      <div className="pm-hx-cue" aria-hidden="true"><span>Scroll</span><i /></div>

      <div className="pm-hx-act2" ref={act}>
        <div>
          <p className="pm-label on-dark"><span className="pm-dot" /> Admissions open — {site.location.split(',')[0]}</p>
          <h1 className="pm-hx-title">Turn your creativity <em>into your career.</em></h1>
        </div>
        <div className="pm-hx-side">
          <p>Professional training in video editing, cinematography, photography and filmmaking — with a premium podcast studio and real production work under one roof.</p>
          <div className="pm-row on-dark">
            <Link href="/courses" className="pm-btn" tabIndex={act2 ? undefined : -1}>Explore Our Courses <ArrowUpRight size={15} /></Link>
            <Link href="/podcast-studio#enquire" className="pm-btn ghost on-dark" tabIndex={act2 ? undefined : -1}>Book Our Podcast Studio</Link>
          </div>
        </div>
      </div>
    </div>
  </section>;
}
