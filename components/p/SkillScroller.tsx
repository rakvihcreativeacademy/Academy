'use client';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import Link from '@/components/SiteLink';
import styles from '@/app/(website)/home-motion.module.css';

export type ScrollCourse = { name: string; caption: string; image: string; href: string; upcoming: boolean };

/**
 * Adobe "The right app for any idea"-style list. The names and the image stay pinned just under the
 * header; scrolling moves the highlight from one course to the next and swaps the image to match.
 * The track is only as tall as the pinned block plus a short scroll per course, so there is no empty band.
 */
export default function SkillScroller({ courses, children }: { courses: ScrollCourse[]; children?: ReactNode }) {
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const pinned = useRef<HTMLDivElement>(null);
  const count = courses.length;

  const travel = () => {
    const el = track.current, pin = pinned.current;
    return el && pin ? el.offsetHeight - pin.offsetHeight : 0;
  };
  const stickyTop = () => (pinned.current ? parseFloat(getComputedStyle(pinned.current).top) || 0 : 0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = track.current;
      if (!el) return;
      const t = travel();
      const scrolled = stickyTop() - el.getBoundingClientRect().top;
      const progress = t > 0 ? Math.min(Math.max(scrolled / t, 0), 0.9999) : 0;
      setActive(Math.floor(progress * count));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, [count]);

  /** Clicking a name scrolls to the point where that course becomes active. */
  const jump = (i: number) => {
    const el = track.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - stickyTop() + travel() * ((i + 0.5) / count);
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <div ref={track} className={styles.scrollTrack} style={{ '--count': count } as CSSProperties}>
      <div ref={pinned} className={styles.scrollPin}>
        {children}
        <div className={styles.scroller}>
        <div className={styles.namesCol}>
        <span className={styles.railTrack} aria-hidden="true"><i style={{ height: `${((active + 1) / count) * 100}%` }} /></span>
        <ol className={styles.scrollNames}>
          {courses.map((c, i) => (
            <li key={c.name} className={i === active ? styles.nameOn : undefined} aria-current={i === active ? 'true' : undefined}>
              <button type="button" onClick={() => jump(i)}>
                <b className={styles.nameNum}>{String(i + 1).padStart(2, '0')}</b>
                <span>{c.name}</span>
                {c.upcoming ? <em className={styles.soonTag}>Upcoming</em> : <em className={styles.liveTag}>Live now</em>}
              </button>
            </li>
          ))}
        </ol>
        </div>
        <div className={styles.scrollStage}>
          <span className={styles.stageCount} aria-hidden="true"><b>{String(active + 1).padStart(2, '0')}</b> / {String(count).padStart(2, '0')}</span>
          {courses.map((c, i) => (
            <figure key={c.name} className={`${styles.scrollShot} ${i === active ? styles.shotOn : ''}`} aria-hidden={i !== active}>
              <img src={c.image} alt={c.name} width={1200} height={1400} loading={i < 2 ? 'eager' : 'lazy'} />
              <figcaption>
                <strong>{c.name}</strong>
                <span>{c.caption}</span>
                <Link href={c.href} tabIndex={i === active ? 0 : -1}>{c.upcoming ? 'See upcoming dates' : 'View course'} <ArrowUpRight size={15} /></Link>
              </figcaption>
            </figure>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
