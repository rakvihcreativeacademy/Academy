'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import Link from '@/components/SiteLink';
import { site } from '@/lib/site';
import type { HeroCamera } from '@/lib/three/hero-camera';
import { PART_LABELS } from '@/lib/three/part-labels';

const MOUNTAIN_PLATE = '/images/videography-mountains.jpg';

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Videography showcase section with the 3D Sony Alpha + G Master camera.
 * Scroll story:
 *   Act I   — Sony Alpha G Master camera floats inside the viewfinder frame
 *   Burst   — lens & body assemblies explode outward and reveal 7 part callout labels
 *   Rebuild — 360° reassembly ending face-on into the G Master front glass
 *   Dive    — flies through the lens iris into a golden-hour alpine mountain vista
 */
export default function VideographyStage({ label = '(02)' }: { label?: string }) {
  const root = useRef<HTMLElement>(null);
  const win = useRef<HTMLDivElement>(null);
  const words = useRef<HTMLParagraphElement>(null);
  const act = useRef<HTMLDivElement>(null);
  const meta = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const cam = useRef<HeroCamera | null>(null);
  const tags = useRef<HTMLDivElement>(null);
  const tc = useRef<HTMLSpanElement>(null);
  const [act2, setAct2] = useState(false);
  const [three, setThree] = useState<'loading' | 'on' | 'off'>('loading');

  // viewfinder timecode (HH:MM:SS:FF at 24 fps), ticking while section is near viewport
  useEffect(() => {
    const t0 = performance.now();
    const id = window.setInterval(() => {
      const el = tc.current, sec = root.current;
      if (!el || !sec) return;
      const r = sec.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
      const s = (performance.now() - t0) / 1000, f = Math.floor((s % 1) * 24);
      el.textContent = `00:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(Math.floor(s) % 60).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
    }, 1000 / 12);
    return () => clearInterval(id);
  }, []);

  // mount the 3D scene as the visitor approaches the section
  useEffect(() => {
    const el = root.current; if (!el) return;
    let dead = false, mounted: HeroCamera | null = null, started = false;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const start = async () => {
      if (started || dead) return;
      started = true;
      const { canWebGL } = await import('@/lib/three/stage');
      if (dead) return;
      if (conn?.saveData || !canWebGL() || !canvas.current) { setThree('off'); return; }
      try {
        const { mountHeroCamera } = await import('@/lib/three/hero-camera');
        if (dead || !canvas.current) return;
        const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        mounted = mountHeroCamera(canvas.current, { still });
        cam.current = mounted;
        const full = () => Math.hypot(window.innerWidth, window.innerHeight) / 2 + 2;
        let lastClip = '';
        mounted.onLens((x, y, r, p) => {
          const w = win.current; if (!w) return;
          const st = stage.current; if (st && window.innerWidth < 900) { x += st.offsetLeft; y += st.offsetTop; }
          const o = clamp((p - .64) / .16), f = full();
          const cx = x + (window.innerWidth / 2 - x) * o * o, cy = y + (window.innerHeight / 2 - y) * o * o;
          const base = Math.min(r * .78, f), rad = o <= 0 ? 0 : base + (f * 1.25 - base) * o * o * o;
          const clip = o >= 1 ? 'none' : `circle(${rad.toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px)`;
          if (clip !== lastClip) { w.style.clipPath = clip; w.style.setProperty('--clip', clip); lastClip = clip; }
          w.style.setProperty('--sh', clamp((p - .72) / .14).toFixed(3));
        });
        let widths: number[] = [], widthsFor = 0, wasShown = true;
        mounted.onLabels(list => {
          const box = tags.current; if (!box) return;
          const shown = list.some(l => l.o > 0.01);
          if (!shown && !wasShown) return;
          wasShown = shown;
          const els = box.children as HTMLCollectionOf<HTMLElement>;
          const small = window.innerWidth < 900, gap = small ? 36 : 66, H = window.innerHeight, run = small ? 26 : 120;
          const st = stage.current, ox = st ? st.offsetLeft : 0, oy = st ? st.offsetTop : 0;
          list = list.map((l, n) => ({ ...l, x: l.x + ox, y: l.y + oy, side: !small && n === 6 ? 'l' : l.side }));
          const ys = list.map(l => l.y), top = small ? 70 : 205;
          (['l', 'r'] as const).forEach(side => {
            const ids = list.map((l, n) => n).filter(n => list[n].side === side && list[n].o > 0.01).sort((a, b) => list[a].y - list[b].y);
            let prev = top - gap;
            ids.forEach(n => { ys[n] = Math.max(list[n].y, prev + gap); prev = ys[n]; });
            let limit = H - (small ? 120 : 60);
            [...ids].reverse().forEach(n => { ys[n] = Math.min(ys[n], limit); limit = ys[n] - gap; });
          });
          const W = window.innerWidth;
          if (!widths.length || widthsFor !== W) { widths = Array.from(els).map(el => (el.lastElementChild as HTMLElement | null)?.offsetWidth ?? 0); widthsFor = W; }
          list.forEach((l, n) => {
            const el = els[n]; if (!el) return;
            const dy = ys[n] - l.y;
            const want = run + 6, room = l.side === 'r' ? W - 12 - l.x - widths[n] : l.x - 12 - widths[n];
            const dx = Math.min(want, room) - 6;
            el.style.setProperty('--dx', `${dx.toFixed(1)}px`);
            el.style.opacity = l.o.toFixed(3);
            el.style.transform = `translate3d(${l.x.toFixed(1)}px, ${l.y.toFixed(1)}px, 0)`;
            el.style.setProperty('--dy', `${dy.toFixed(1)}px`);
            el.style.setProperty('--len', `${Math.hypot(dx, dy).toFixed(1)}px`);
            el.style.setProperty('--ang', `${Math.atan2(dy, dx).toFixed(4)}rad`);
            el.dataset.side = l.side;
            el.style.visibility = l.o > 0.01 ? 'visible' : 'hidden';
          });
        });
        window.dispatchEvent(new Event('scroll'));
        await mounted.ready;
        if (!dead) setThree('on');
      } catch { if (!dead) setThree('off'); }
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); start(); } }, { rootMargin: '1400px 0px' });
    io.observe(el);
    return () => { dead = true; io.disconnect(); mounted?.dispose(); cam.current = null; };
  }, []);

  useEffect(() => {
    const el = root.current; if (!el) return;
    const mq = window.matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)');
    let raf = 0, was = false, layout = '';
    const reset = () => { [win, words, act, meta, stage].forEach(r => r.current?.removeAttribute('style')); Array.from(words.current?.children ?? []).forEach(s => s.removeAttribute('style')); };
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      if (!mq.matches) {
        if (layout !== 'm') { reset(); layout = 'm'; }
        cam.current?.setMode('compact');
        const pm = clamp(-r.top / Math.max(1, r.height - window.innerHeight));
        cam.current?.setProgress(pm);
        if (cam.current && words.current) {
          const away = clamp((pm - .08) / .08) * (1 - clamp((pm - .8) / .08));
          words.current.style.opacity = String(1 - away);
          words.current.style.transform = `translate3d(0, ${(-away * 14).toFixed(1)}px, 0)`;
          if (meta.current) meta.current.style.opacity = String(1 - away);
        }
        if (cam.current && stage.current) stage.current.style.opacity = String(1 - clamp((pm - .76) / .06));
        if (!was) { was = true; setAct2(true); }
        return;
      }
      if (layout !== 'd') { reset(); layout = 'd'; }
      cam.current?.setMode('dive');
      const p = clamp(-r.top / Math.max(1, r.height - window.innerHeight));
      cam.current?.setProgress(p);
      const e1 = ease(clamp(p / .1));
      if (!cam.current && win.current) {
        const full = Math.hypot(window.innerWidth, window.innerHeight) / 2 + 2, r0 = Math.min(window.innerWidth, window.innerHeight) * .2;
        const rad = r0 + (full - r0) * ease(clamp(p / .6));
        win.current.style.clipPath = rad >= full - 1 ? 'none' : `circle(${rad.toFixed(1)}px at 50% 50%)`;
        win.current.style.setProperty('--sh', clamp((p - .5) / .2).toFixed(3));
      }
      if (stage.current) stage.current.style.opacity = String(1 - clamp((p - .76) / .06));
      if (words.current) {
        const sp = words.current.children;
        const dx = e1 * 10, dy = e1 * 8, o = String(Math.max(0, 1 - e1 * 1.2));
        const set = (n: number, x: number, y: number) => { const w = sp[n] as HTMLElement | undefined; if (w) { w.style.transform = `translate3d(${x}vw, ${y}vh, 0)`; w.style.opacity = o; } };
        set(0, -dx, -dy); set(1, dx, -dy); set(2, -dx, dy); set(3, dx, dy);
      }
      if (meta.current) meta.current.style.opacity = String(Math.max(0, 1 - e1 * 2));
      const e2 = clamp((p - .8) / .14);
      if (act.current) { act.current.style.opacity = e2.toFixed(3); act.current.style.transform = `translate3d(0, ${((1 - e2) * 50).toFixed(1)}px, 0)`; }
      const on = e2 > .4;
      if (on !== was) { was = on; setAct2(on); }
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    const move = (e: PointerEvent) => { if (e.pointerType === 'mouse') cam.current?.setPointer(e.clientX / window.innerWidth * 2 - 1, e.clientY / window.innerHeight * 2 - 1); };
    update();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    window.addEventListener('pointermove', move, { passive: true });
    mq.addEventListener('change', on);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on); window.removeEventListener('resize', on); window.removeEventListener('pointermove', move); mq.removeEventListener('change', on); };
  }, []);

  return <section ref={root} className={'pm-hx pm-vg' + (act2 ? ' act2' : '') + ' three-' + three} data-dark aria-labelledby="vg-title">
    <div className="pm-hx-stick">
      <div className="pm-hx-bg" aria-hidden="true">
        <div className="pm-hx-vf">
          <img src="/images/hero-viewfinder.webp" alt="" loading="lazy" decoding="async" />
          <i className="rec" /><span className="tc" ref={tc}>00:00:00:00</span>
        </div>
      </div>

      <div className="pm-vg-head" ref={meta}>
        <p className="pm-label rule on-dark">{label} — <b>Videography</b></p>
        <span className="pm-vg-spec">Sony Alpha · FE 24–70mm f/2.8 GM</span>
      </div>

      <div className="pm-hx-win" ref={win}>
        <img
          src={MOUNTAIN_PLATE}
          alt="Golden-hour sunrise over alpine mountain peaks and clouds"
          className="on pm-vg-mountain"
          loading="eager"
          decoding="async"
        />
        <span className="pm-hx-shade" />
      </div>

      <div className="pm-hx-stage" ref={stage} aria-hidden="true">
        <span className="pm-hx-glow" />
        <canvas ref={canvas} />
      </div>

      <div className="pm-hx-tags" ref={tags} aria-hidden="true">
        {PART_LABELS.map((l, n) => <div key={l.t} className="pm-hx-tag" style={{ opacity: 0, visibility: 'hidden' }}>
          <i className="dot" /><i className="line" />
          <span className="card"><b><span className="pm-num">{String(n + 1).padStart(2, '0')}</span>{l.t}</b><small>{l.d}</small></span>
        </div>)}
      </div>

      <p className="pm-hx-words" ref={words} aria-label={site.campaign}>
        <span className="w1"><span>Create.</span></span><span className="w2"><span><em>Capture.</em></span></span>
        <span className="w3"><span><em>Edit.</em></span></span><span className="w4"><span>Inspire.</span></span>
      </p>

      <div className="pm-hx-act2" ref={act}>
        <div>
          <p className="pm-label rule on-dark">{label} — <b>Videography</b></p>
          <h2 id="vg-title" className="pm-hx-title">Frame every story <em>through cinema optics.</em></h2>
        </div>
        <div className="pm-hx-side">
          <p>Master full-frame cinematography, manual exposure, lens craft and visual storytelling — from capturing dramatic light on set to grading the final cut.</p>
          <div className="pm-row on-dark">
            <Link href="/courses#cinematography" className="pm-btn" tabIndex={act2 ? undefined : -1}>Explore Cinematography <ArrowUpRight size={15} /></Link>
            <Link href="/courses" className="pm-btn ghost on-dark" tabIndex={act2 ? undefined : -1}>All Programmes</Link>
          </div>
        </div>
      </div>
    </div>
  </section>;
}
