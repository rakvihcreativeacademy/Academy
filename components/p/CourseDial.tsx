'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, MessageCircle, Layers, Clock3, Sparkles } from 'lucide-react';
import Link from '@/components/SiteLink';
import { site, whatsappLink } from '@/lib/site';

export type DialCourse = { id: string; title: string; short: string; tag: string; description: string; details: string[]; image: string; href: string; skills: string[] };

const BLADES = 9;
const sm = (v: number) => { v = Math.min(1, Math.max(0, v)); return v * v * (3 - 2 * v); };

/**
 * "The Programme Dial": the courses as a camera lens you operate by scrolling.
 * The focus ring carries the programmes like aperture stops and click-stops to the index;
 * inside, a real iris (nine half-plane blades) closes and re-opens on each change of course.
 * Course ids are anchored inside the pinned section so /courses#slug lands on that stop.
 */
export default function CourseDial({ items }: { items: DialCourse[] }) {
  const root = useRef<HTMLElement>(null);
  const dial = useRef<HTMLDivElement>(null);
  const [cur, setCur] = useState(0);
  const n = items.length, step = 360 / n;

  useEffect(() => {
    const el = root.current, d = dial.current; if (!el || !d) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, last = -1;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = Math.min(0.9999, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)));
      const seg = p * n, i = Math.min(n - 1, Math.floor(seg)), f = seg - i;
      // rest on each programme, then click over to the next one in the last part of its segment
      const t = i < n - 1 && !reduce ? sm((f - 0.7) / 0.3) : 0;
      const shown = t < 0.5 ? i : i + 1;
      d.style.setProperty('--rot', `${(-(i + t) * step).toFixed(3)}deg`);
      d.style.setProperty('--ap', (0.12 + 0.88 * Math.abs(1 - 2 * t)).toFixed(4));   // iris: open → closed → open
      el.style.setProperty('--dp', p.toFixed(4));
      if (shown !== last) { last = shown; setCur(shown); }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    // the lens leans towards the pointer and its reflection follows
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const b = d.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
      d.style.setProperty('--tx', (Math.max(-0.6, Math.min(0.6, x))).toFixed(3));
      d.style.setProperty('--ty', (Math.max(-0.6, Math.min(0.6, y))).toFixed(3));
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('pointermove', move, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); window.removeEventListener('pointermove', move); };
  }, [n, step]);

  const ticks = useMemo(() => Array.from({ length: 120 }, (_, k) => k), []);
  const knurl = useMemo(() => Array.from({ length: 180 }, (_, k) => k), []);
  const c = items[cur];

  return <section ref={root} className="pm-dial" style={{ '--n': n } as React.CSSProperties} aria-labelledby="dial-title">
    {/* scroll stops: one anchor per programme, so links and the chapter bar land on the right course */}
    <div className="pm-dial-stops" aria-hidden="true">{items.map(it => <span key={it.id} id={it.id} />)}</div>

    <div className="pm-dial-stick">
      <div className="pm-wrap pm-dial-grid">
        <div className="pm-dial-left">
          <div className="pm-dial-lens" ref={dial}>
            <svg viewBox="-300 -300 600 600" role="img" aria-label={`Programme dial — ${c.title} selected`}>
              <defs>
                <radialGradient id="dl-metal" cx="50%" cy="38%" r="70%"><stop offset="0" stopColor="var(--dl-m1)" /><stop offset=".6" stopColor="var(--dl-m2)" /><stop offset="1" stopColor="var(--dl-m3)" /></radialGradient>
                <radialGradient id="dl-glass" cx="42%" cy="34%" r="75%"><stop offset="0" stopColor="#1d2230" /><stop offset=".55" stopColor="#07080b" /><stop offset="1" stopColor="#000" /></radialGradient>
                <linearGradient id="dl-blade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2a2d26" /><stop offset=".5" stopColor="#121410" /><stop offset="1" stopColor="#1e211b" /></linearGradient>
                <radialGradient id="dl-flare" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
                <radialGradient id="dl-vig" cx="50%" cy="50%" r="50%"><stop offset=".55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".75" /></radialGradient>
                <clipPath id="dl-photo"><circle r="168" /></clipPath>
                <path id="dl-engrave" d="M -186 0 A 186 186 0 1 1 186 0 A 186 186 0 1 1 -186 0" />
              </defs>

              {/* knurled grip ring */}
              <circle r="296" fill="url(#dl-metal)" />
              <g className="dl-knurl">{knurl.map(k => <line key={k} x1="0" y1="-296" x2="0" y2="-276" transform={`rotate(${k * 2})`} />)}</g>
              <circle r="276" className="dl-groove" />

              {/* the programme ring — rotates */}
              <g className="dl-ring">
                <circle r="262" className="dl-band" />
                <g className="dl-ticks">{ticks.map(k => <line key={k} x1="0" y1="-262" x2="0" y2={k % 5 === 0 ? -250 : -255} transform={`rotate(${k * 3})`} />)}</g>
                {items.map((it, k) => <g key={it.id} transform={`rotate(${k * step})`} className={'dl-stop' + (k === cur ? ' on' : '')}>
                  <line x1="0" y1="-262" x2="0" y2="-242" className="dl-stop-tick" />
                  <text y="-224" className="dl-num">{String(k + 1).padStart(2, '0')}</text>
                  <text y="-206" className="dl-lab">{it.short}</text>
                </g>)}
              </g>

              {/* fixed index mark */}
              <path d="M 0 -268 L -9 -284 L 9 -284 Z" className="dl-index" />
              <line x1="0" y1="-268" x2="0" y2="-200" className="dl-index-line" />

              {/* lens barrel + glass */}
              <circle r="198" className="dl-barrel" />
              <text className="dl-engrave"><textPath href="#dl-engrave" startOffset="0">RAKVIH DIGITAL · PROGRAMME LENS 1:1.4 · 8 DISCIPLINES · ONE CREATIVE CAREER · </textPath></text>
              <circle r="176" fill="url(#dl-glass)" />

              {/* photograph seen through the lens */}
              <g clipPath="url(#dl-photo)">
                {items.map((it, k) => <image key={it.id} href={it.image} x="-168" y="-168" width="336" height="336" preserveAspectRatio="xMidYMid slice" className={'dl-img' + (k === cur ? ' on' : '')} />)}
                <circle r="168" fill="url(#dl-vig)" />
                {/* iris: nine half-planes, each pushed out by the aperture → a nine-sided opening */}
                <g className="dl-iris">{Array.from({ length: BLADES }, (_, k) => <g key={k} style={{ transform: `rotate(${k * (360 / BLADES)}deg)` }}>
                  <path d="M -260 0 L 260 0 L 260 -400 L -260 -400 Z" className="dl-blade" />
                </g>)}</g>
              </g>

              {/* glass reflections */}
              <circle r="176" className="dl-rim" />
              <circle r="150" className="dl-rim2" />
              <ellipse className="dl-glint" cx="-60" cy="-92" rx="70" ry="34" transform="rotate(-28 -60 -92)" />
              <circle className="dl-flare" r="120" fill="url(#dl-flare)" />
            </svg>
          </div>
          <div className="pm-dial-counter" aria-hidden="true"><b className="pm-num">{String(cur + 1).padStart(2, '0')}</b><span>/ {String(n).padStart(2, '0')}</span></div>
        </div>

        <div className="pm-dial-info">
          <p className="pm-label rule"><b>The Programme Dial</b> — scroll to turn</p>
          <div className="pm-dial-card" key={c.id} aria-live="polite">
            <p className="pm-dial-tag"><span className="pm-num">{String(cur + 1).padStart(2, '0')}</span>{c.tag}</p>
            <h2 id="dial-title" className="pm-dial-title">{c.title}</h2>
            <p className="pm-dial-desc">{c.description}</p>
            <ul className="pm-dial-facts">
              <li><Layers size={15} /> {c.details.length} modules</li>
              <li><Clock3 size={15} /> Project-based learning</li>
              <li><Sparkles size={15} /> Completion certificate</li>
            </ul>
            <p className="pm-dial-sub">What you’ll learn</p>
            <ul className="pm-dial-mods">{c.details.map((m, k) => <li key={m} style={{ '--k': k } as React.CSSProperties}><span className="pm-num">{String(k + 1).padStart(2, '0')}</span>{m}</li>)}</ul>
            <div className="pm-row pm-dial-cta">
              <Link href={c.href} className="pm-btn">Enquire for this course <ArrowUpRight size={15} /></Link>
              <a href={whatsappLink(`Hello ${site.name}, I’d like details about ${c.title}.`)} target="_blank" rel="noopener noreferrer" className="pm-btn ghost"><MessageCircle size={15} /> WhatsApp</a>
            </div>
          </div>
          <ol className="pm-dial-rail" aria-label="Programmes">
            {items.map((it, k) => <li key={it.id} className={k === cur ? 'on' : k < cur ? 'done' : ''}><a href={'#' + it.id} aria-label={it.title}><i /></a></li>)}
          </ol>
        </div>
      </div>
    </div>
  </section>;
}
