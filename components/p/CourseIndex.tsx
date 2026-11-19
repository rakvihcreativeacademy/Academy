'use client';
import { useRef, useState } from 'react';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import Link from '@/components/SiteLink';
import { courses } from '@/lib/courses';
import { courseImages } from '@/lib/course-images';

/**
 * Course showcase: a framed "viewer" on the left shows the hovered/focused programme,
 * a numbered index on the right lists all eight. On phones it becomes a swipeable row of cards.
 */
export default function CourseIndex() {
  const [a, setA] = useState(0);
  const [m, setM] = useState(0); // phone carousel position
  const track = useRef<HTMLDivElement>(null);
  const c = courses[a];
  const onTrack = () => {
    const t = track.current; if (!t) return;
    const card = t.firstElementChild as HTMLElement | null; if (!card) return;
    setM(Math.min(courses.length - 1, Math.round(t.scrollLeft / (card.offsetWidth + 12))));
  };
  const goTo = (i: number) => {
    const t = track.current; const el = t?.children[i] as HTMLElement | undefined;
    if (t && el) el.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  };
  return <div className="cs" data-v>
    <div className="cs-viewer" aria-live="polite">
      <div className="cs-frame">
        {courses.map((x, i) => <img key={x.slug} src={courseImages[x.slug].src} alt={i === a ? courseImages[x.slug].alt : ''} className={i === a ? 'on' : ''} loading={i < 2 ? 'eager' : 'lazy'} decoding="async" />)}
        <span className="cs-shade" />
        <span className="cs-count"><b>{c.symbol}</b> / 08</span>
        <div className="cs-caption" key={c.slug}>
          <span className="cs-tag">{c.tag}</span>
          <h3>{c.title}</h3>
          <p>{c.description}</p>
          <ul>{c.skills.map(s => <li key={s}>{s}</li>)}</ul>
          <Link href={`/courses#${c.slug}`} className="pm-btn sm">View curriculum <ArrowUpRight size={14} /></Link>
        </div>
      </div>
    </div>
    <ol className="cs-list">
      {courses.map((x, i) => <li key={x.slug} style={{ '--k': i } as React.CSSProperties}>
        <Link href={`/courses#${x.slug}`} className={'cs-row' + (i === a ? ' on' : '')} onMouseEnter={() => setA(i)} onFocus={() => setA(i)}>
          <span className="cs-n">{x.symbol}</span>
          <span className="cs-t">{x.title}<small>{x.tag}</small></span>
          <span className="cs-go" aria-hidden="true"><ArrowUpRight size={16} /></span>
          <span className="cs-bar" aria-hidden="true" />
        </Link>
      </li>)}
    </ol>
    <div className="cs-cards" aria-label="Courses — swipe to see all 8" ref={track} onScroll={onTrack}>
      {courses.map(x => <Link key={x.slug} href={`/courses#${x.slug}`} className="cs-card">
        <img src={courseImages[x.slug].src} alt="" loading="lazy" />
        <span className="cs-card-n">{x.symbol}</span>
        <span className="cs-card-t"><small>{x.tag}</small>{x.title}</span>
      </Link>)}
    </div>
    <div className="cs-pager">
      <span className="cs-pager-n"><b>{String(m + 1).padStart(2, '0')}</b> / {String(courses.length).padStart(2, '0')}</span>
      <div className="cs-dots" role="tablist" aria-label="Choose a course">
        {courses.map((x, i) => <button key={x.slug} type="button" role="tab" aria-selected={i === m} aria-label={x.title} className={i === m ? 'on' : ''} onClick={() => goTo(i)} />)}
      </div>
      <span className="cs-swipe" aria-hidden="true">Swipe <ArrowRight size={13} /></span>
    </div>
  </div>;
}
