'use client';
import { useEffect, useRef, useState } from 'react';
import Link from '@/components/SiteLink';
import { ArrowUpRight, GraduationCap, Mic, Clapperboard, Award } from 'lucide-react';

type Stat = { value: number; label: string; note: string; href: string; icon: 'course' | 'mic' | 'clap' | 'award' };
const ICONS = { course: GraduationCap, mic: Mic, clap: Clapperboard, award: Award };

/** Counts a number up from zero the first time it scrolls into view. */
function Count({ to, run }: { to: number; run: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(to); return; }
    let raf = 0; const t0 = performance.now(), dur = 1300;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      setN(Math.round(to * e));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, to]);
  return <>{String(n).padStart(2, '0')}</>;
}

/** Home key-figures strip: three linked stat cards with an icon, a count-up number and a short note. */
export default function StatsStrip({ stats }: { stats: Stat[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);
  useEffect(() => {
    const el = root.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setRun(true); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <div className="sx" ref={root}>
    {stats.map((s, i) => {
      const Icon = ICONS[s.icon];
      return <Link key={s.label} href={s.href} className="sx-card" style={{ '--i': i } as React.CSSProperties}>
        <span className="sx-top">
          <span className="sx-ico"><Icon size={20} strokeWidth={1.7} /></span>
          <span className="sx-go" aria-hidden="true"><ArrowUpRight size={16} /></span>
        </span>
        <strong className="sx-num"><Count to={s.value} run={run} /></strong>
        <span className="sx-label">{s.label}</span>
        <span className="sx-note">{s.note}</span>
        <span className="sx-bar" aria-hidden="true" />
      </Link>;
    })}
  </div>;
}
