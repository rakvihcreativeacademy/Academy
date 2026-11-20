'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import Link from '@/components/SiteLink';
import { site } from '@/lib/site';
import type { HeroCamera } from '@/lib/three/hero-camera';
import { PART_LABELS } from '@/lib/three/part-labels';

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
 * Scroll hero with a realistic 3D camera.
 * Act I  — the campaign words frame a photo-scanned camera that follows the pointer.
 * Dive   — scrolling turns the camera to face you and flies into the lens…
 * Act II — …which opens, iris-like, onto the photographs; the tagline and CTAs arrive.
 * Below 900px (or with reduced motion) the camera is a gentle turntable inside a stacked layout.
 * Without WebGL the photographs show through a round "lens" instead.
 */
export default function Hero() {
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
  const [i, setI] = useState(0);
  const [act2, setAct2] = useState(false);
  const [three, setThree] = useState<'loading' | 'on' | 'off'>('loading');

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setTimeout(() => setI(n => (n + 1) % plates.length), HOLD);
    return () => clearTimeout(t);
  }, [i]);

  // viewfinder timecode (HH:MM:SS:FF at 24 fps), ticking while the hero is on screen
  useEffect(() => {
    const t0 = performance.now();
    const id = window.setInterval(() => {
      const el = tc.current; if (!el || window.scrollY > window.innerHeight * 5) return;
      const s = (performance.now() - t0) / 1000, f = Math.floor((s % 1) * 24);
      el.textContent = `00:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(Math.floor(s) % 60).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
    }, 1000 / 12);
    return () => clearInterval(id);
  }, []);

  // load the 3D scene after the page is interactive, in its own chunk
  useEffect(() => {
    let dead = false, mounted: HeroCamera | null = null;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const start = async () => {
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
          // on phones the canvas sits in a band of the screen: convert to screen space
          const st = stage.current; if (st && window.innerWidth < 900) { x += st.offsetLeft; y += st.offsetTop; }
          // the photograph appears inside the glass, then opens out to the full frame
          const o = clamp((p - .64) / .16), f = full();
          const cx = x + (window.innerWidth / 2 - x) * o * o, cy = y + (window.innerHeight / 2 - y) * o * o;
          const base = Math.min(r * .78, f), rad = o <= 0 ? 0 : base + (f * 1.25 - base) * o * o * o;
          const clip = o >= 1 ? 'none' : `circle(${rad.toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px)`;
          if (clip !== lastClip) { w.style.clipPath = clip; w.style.setProperty('--clip', clip); lastClip = clip; }
          w.style.setProperty('--sh', clamp((p - .72) / .14).toFixed(3));
        });
        // part labels follow their parts on screen
        let widths: number[] = [], widthsFor = 0, wasShown = true;
        mounted.onLabels(list => {
          const box = tags.current; if (!box) return;
          const shown = list.some(l => l.o > 0.01);
          if (!shown && !wasShown) return;          // nothing to move while all labels are hidden
          wasShown = shown;
          const els = box.children as HTMLCollectionOf<HTMLElement>;
          // stack the cards on each side so they never overlap; leader lines angle to reach them
          const small = window.innerWidth < 900, gap = small ? 36 : 66, H = window.innerHeight, run = small ? 26 : 120;
          // the canvas may sit in a band of the screen (phones): convert to screen space
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
          // card widths only change with the viewport: measure once, not every frame (avoids layout thrash)
          if (!widths.length || widthsFor !== W) { widths = Array.from(els).map(el => (el.lastElementChild as HTMLElement | null)?.offsetWidth ?? 0); widthsFor = W; }
          list.forEach((l, n) => {
            const el = els[n]; if (!el) return;
            const dy = ys[n] - l.y;
            // keep the card inside the screen: shorten / reverse the run if it would spill over the edge
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
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const id = w.requestIdleCallback ? w.requestIdleCallback(start, { timeout: 900 }) : window.setTimeout(start, 120);
    return () => { dead = true; if (!w.requestIdleCallback) clearTimeout(id); mounted?.dispose(); cam.current = null; };
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
        // while the camera is open, the campaign words step aside for the part labels; they return over the photo
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
      // without WebGL the photographs show through a round "lens" that opens with the scroll
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

  return <section ref={root} className={'pm-hx' + (act2 ? ' act2' : '') + ' three-' + three} data-hero data-dark>
    <div className="pm-hx-stick">
      <div className="pm-hx-bg" aria-hidden="true">
        <div className="pm-hx-vf">
          <img src="/images/hero-viewfinder.webp" alt="" fetchPriority="high" decoding="async" />
          <i className="rec" /><span className="tc" ref={tc}>00:00:00:00</span>
        </div>
      </div>
      <div className="pm-hx-meta" ref={meta} aria-hidden="true">
        <span>RAKVIH Digital</span>
        <span className="mid">Bengaluru, India</span>
        <span>Editing · Cinema · Photo · Design</span>
      </div>

      <div className="pm-hx-win" ref={win}>
        {plates.map((p, n) => <img key={p.src} src={p.src} alt="" className={n === i ? 'on' : ''} fetchPriority={n === 0 ? 'high' : 'low'} decoding="async" />)}
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
