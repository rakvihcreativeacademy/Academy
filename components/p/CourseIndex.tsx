'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import Link from '@/components/SiteLink';
import { courses as defaultCourses } from '@/lib/courses';
import { courseImages } from '@/lib/course-images';

export type CourseIndexItem = {
  slug: string;
  title: string;
  tag: string;
  symbol: string;
  description: string;
  skills: string[];
  image: string;
  imageAlt: string;
  live: boolean;
};

const fallbackItems: CourseIndexItem[] = defaultCourses.map(c => ({
  slug: c.slug,
  title: c.title,
  tag: c.tag,
  symbol: c.symbol,
  description: c.description,
  skills: c.skills,
  image: courseImages[c.slug].src,
  imageAlt: courseImages[c.slug].alt,
  live: c.slug === 'video-editing',
}));

/**
 * Course showcase: a framed "viewer" on the left shows the hovered/focused programme,
 * a numbered index on the right lists all active programmes. On phones it becomes a swipeable row of cards.
 */
export default function CourseIndex({ items }: { items?: CourseIndexItem[] }) {
  const list = items && items.length > 0 ? items : fallbackItems;
  const [a, setA] = useState(0);
  const [m, setM] = useState(0); // phone carousel position
  const track = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  // Desktop: the section pins while the page scrolls, and that page scroll drives the course list —
  // wherever the pointer is (photo or list). When the last course is reached the page simply carries on.
  useEffect(() => {
    const pin = pinRef.current, l = listRef.current; if (!pin || !l) return;
    const mq = window.matchMedia('(min-width: 901px)');
    let extra = 0, raf = 0;
    const measure = () => {
      if (!mq.matches) { pin.style.removeProperty('--cs-extra'); extra = 0; return; }
      extra = Math.max(0, l.scrollHeight - l.clientHeight);
      pin.style.setProperty('--cs-extra', `${extra}px`);
    };
    const sync = () => {
      raf = 0;
      if (!mq.matches || !extra) return;
      const head = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pm-head')) || 84;
      const p = Math.min(1, Math.max(0, (head + 20 - pin.getBoundingClientRect().top) / extra));
      l.scrollTop = p * extra;
      pin.style.setProperty('--cs-p', p.toFixed(4));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(sync); };
    const onResize = () => { measure(); onScroll(); };
    measure(); sync();
    const ro = new ResizeObserver(onResize); ro.observe(l);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    mq.addEventListener('change', onResize);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize); mq.removeEventListener('change', onResize); };
  }, []);
  // the course list scrolls on its own beside the fixed photo; the photo follows the row at the top of the list
  const onList = () => {
    const l = listRef.current; if (!l) return;
    const rows = Array.from(l.children) as HTMLElement[];
    if (l.scrollTop + l.clientHeight >= l.scrollHeight - 4) { setA(rows.length - 1); return; }
    const top = l.scrollTop + 8;
    let i = rows.findIndex(r => r.offsetTop + r.offsetHeight / 2 > top);
    if (i < 0) i = rows.length - 1;
    setA(i);
  };
  const safeIndex = Math.min(a, list.length - 1);
  const c = list[safeIndex];
  const totalLabel = String(list.length).padStart(2, '0');

  const onTrack = () => {
    const t = track.current; if (!t) return;
    const card = t.firstElementChild as HTMLElement | null; if (!card) return;
    setM(Math.min(list.length - 1, Math.round(t.scrollLeft / (card.offsetWidth + 12))));
  };
  const goTo = (i: number) => {
    const t = track.current; const el = t?.children[i] as HTMLElement | undefined;
    if (t && el) el.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  };
  const activeLive = c.live;
  return <div className="cs-pin" ref={pinRef}><div className="cs" data-v>
    <div className="cs-viewer" aria-live="polite">
      <div className={'cs-frame' + (activeLive ? ' is-live' : '')}>
        {list.map((x, i) => <img key={x.slug} src={x.image} alt={i === safeIndex ? x.imageAlt : ''} className={i === safeIndex ? 'on' : ''} loading={i < 2 ? 'eager' : 'lazy'} decoding="async" />)}
        <span className="cs-shade" />
        <span className="cs-count"><b>{c.symbol}</b> / {totalLabel}</span>
        <div className="cs-caption" key={c.slug}>
          <div className="cs-caption-top">
            <span className="cs-tag">{c.tag}</span>
            <span className={'cs-pill ' + (activeLive ? 'is-live' : 'is-upcoming')}>
              {activeLive && <i aria-hidden="true" />}
              {activeLive ? 'Live' : 'Upcoming'}
            </span>
          </div>
          <h3>{c.title}</h3>
          <p>{c.description}</p>
          {c.skills.length > 0 && <ul>{c.skills.map(s => <li key={s}>{s}</li>)}</ul>}
          <Link href={`/courses#${c.slug}`} className="pm-btn sm">View curriculum <ArrowUpRight size={14} /></Link>
        </div>
      </div>
    </div>
    <ol className="cs-list" ref={listRef} onScroll={onList} aria-label="Courses">
      {list.map((x, i) => {
        const live = x.live;
        return <li key={x.slug} style={{ '--k': i } as React.CSSProperties}>
          <Link href={`/courses#${x.slug}`} className={'cs-row' + (i === safeIndex ? ' on' : '') + (live ? ' is-live' : '')} onMouseEnter={() => setA(i)} onFocus={() => setA(i)}>
            <span className="cs-n">{x.symbol}</span>
            <span className="cs-t">
              <span className="cs-t-name">{x.title}</span>
              <span className="cs-t-sub">
                <span className={'cs-pill ' + (live ? 'is-live' : 'is-upcoming')}>
                  {live && <i aria-hidden="true" />}
                  {live ? 'Live' : 'Upcoming'}
                </span>
                <small>{x.tag}</small>
              </span>
            </span>
            <span className="cs-go" aria-hidden="true"><ArrowUpRight size={16} /></span>
            <span className="cs-bar" aria-hidden="true" />
          </Link>
        </li>;
      })}
    </ol>
    <div className="cs-cards" aria-label={`Courses — swipe to see all ${list.length}`} ref={track} onScroll={onTrack}>
      {list.map(x => {
        const live = x.live;
        return <Link key={x.slug} href={`/courses#${x.slug}`} className={'cs-card' + (live ? ' is-live' : '')}>
          <img src={x.image} alt="" loading="lazy" />
          <span className="cs-card-n">{x.symbol}</span>
          <span className="cs-card-t">
            <small>{x.tag}</small>
            <span>{x.title}</span>
            <span className={'cs-pill ' + (live ? 'is-live' : 'is-upcoming')}>
              {live && <i aria-hidden="true" />}
              {live ? 'Live' : 'Upcoming'}
            </span>
          </span>
        </Link>;
      })}
    </div>
    <div className="cs-pager">
      <span className="cs-pager-n"><b>{String(m + 1).padStart(2, '0')}</b> / {totalLabel}</span>
      <div className="cs-dots" role="tablist" aria-label="Choose a course">
        {list.map((x, i) => <button key={x.slug} type="button" role="tab" aria-selected={i === m} aria-label={x.title} className={i === m ? 'on' : ''} onClick={() => goTo(i)} />)}
      </div>
      <span className="cs-swipe" aria-hidden="true">Swipe <ArrowRight size={13} /></span>
    </div>
  </div></div>;
}
