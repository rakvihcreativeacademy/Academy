'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import Link from '@/components/SiteLink';
import styles from '@/app/(website)/home-motion.module.css';

export type RailCourse = { name: string; caption: string; image: string; href: string; upcoming: boolean };

/** Horizontal row of tall neon poster cards: swipe / scroll on touch, arrow buttons on desktop. */
export default function CourseRail({ courses }: { courses: RailCourse[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: false, end: false });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const update = () => {
      const half = el.scrollWidth / 2;
      setEdge({ start: false, end: false });
      setProgress(half > 0 ? (el.scrollLeft % half) / half : 0);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);

  // slow continuous auto-scroll; the list is rendered twice so it can wrap seamlessly.
  // Pauses on hover, touch or keyboard focus, and is off for reduced-motion users.
  const paused = useRef(false);
  useEffect(() => {
    const el = rail.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0, last = performance.now(), visible = true, pos = el.scrollLeft;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(el);
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(now - last, 50);
      last = now;
      if (!visible || paused.current) { pos = el.scrollLeft; return; }
      const half = el.scrollWidth / 2;
      pos += dt * 0.035; // ~35px per second
      if (pos >= half) pos -= half;
      el.scrollLeft = pos;
    };
    raf = requestAnimationFrame(tick);
    const pause = () => { paused.current = true; };
    const resume = () => { paused.current = false; };
    el.addEventListener('pointerenter', pause);
    el.addEventListener('pointerleave', resume);
    el.addEventListener('touchstart', pause, { passive: true });
    el.addEventListener('touchend', () => setTimeout(resume, 2500), { passive: true });
    el.addEventListener('focusin', pause);
    el.addEventListener('focusout', resume);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, []);

  const step = (dir: 1 | -1) => {
    const el = rail.current;
    const card = el?.querySelector<HTMLElement>('[data-card]');
    if (!el || !card) return;
    paused.current = true;
    el.scrollBy({ left: dir * (card.offsetWidth + 16) * 2, behavior: 'smooth' });
    window.setTimeout(() => { paused.current = false; }, 2500);
  };

  return (
    <div className={styles.rail}>
      <div ref={rail} className={styles.railTrackX} data-lenis-prevent-horizontal>
        {[...courses, ...courses].map((c, n) => { const i = n % courses.length; const copy = n >= courses.length; return (
          <Link key={`${c.name}-${n}`} href={c.href} data-card aria-hidden={copy || undefined} tabIndex={copy ? -1 : undefined} className={`${styles.poster} ${!c.upcoming ? styles.posterLive : ''}`} style={{ '--i': i } as CSSProperties}>
            <img src={c.image} alt="" width={700} height={960} loading={i < 4 ? 'eager' : 'lazy'} />
            <span className={styles.posterNum}>{String(i + 1).padStart(2, '0')}</span>
            <span className={c.upcoming ? styles.posterSoon : styles.posterLiveTag}>{c.upcoming ? 'Upcoming' : <><i /> Live now</>}</span>
            <div className={styles.posterBody}>
              <h3>{c.name}</h3>
              <p>{c.caption}</p>
              <span className={styles.posterCta}>{c.upcoming ? 'See dates' : 'View course'} <ArrowUpRight size={15} /></span>
            </div>
          </Link>
        ); })}
      </div>
      <div className={styles.railBar}>
        <span className={styles.railProgress} aria-hidden="true"><i style={{ width: `${Math.max(12, progress * 100)}%` }} /></span>
        <div className={styles.railBtns}>
          <button type="button" aria-label="Previous courses" disabled={edge.start} onClick={() => step(-1)}><ArrowLeft size={18} /></button>
          <button type="button" aria-label="Next courses" disabled={edge.end} onClick={() => step(1)}><ArrowRight size={18} /></button>
        </div>
      </div>
    </div>
  );
}
