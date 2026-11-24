'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowDownRight, ChevronLeft, ChevronRight } from 'lucide-react';

export type Chapter = { id: string; label: string };

/**
 * Sticky chapter bar under the header for long inner pages: numbered pills for each section,
 * the current one highlighted, and a reading-progress line. Scrolls horizontally on phones.
 */
export default function ChapterNav({ items, title }: { items: Chapter[]; title?: string }) {
  const [active, setActive] = useState(items[0]?.id ?? '');
  const bar = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const [edge, setEdge] = useState({ l: false, r: false });

  // show the scroll arrows only when more chapters are hidden on that side
  useEffect(() => {
    const t = track.current; if (!t) return;
    const check = () => setEdge({ l: t.scrollLeft > 4, r: t.scrollLeft + t.clientWidth < t.scrollWidth - 4 });
    check();
    t.addEventListener('scroll', check, { passive: true });
    const ro = new ResizeObserver(check); ro.observe(t);
    return () => { t.removeEventListener('scroll', check); ro.disconnect(); };
  }, [items]);
  const nudge = (dir: 1 | -1) => { const t = track.current; if (t) t.scrollBy({ left: dir * t.clientWidth * 0.6, behavior: 'smooth' }); };

  useEffect(() => {
    const targets = items.map(i => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    if (!targets.length) return;
    const io = new IntersectionObserver(entries => {
      const seen = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (seen[0]) setActive(seen[0].target.id);
    }, { rootMargin: '-35% 0px -60% 0px' });
    targets.forEach(t => io.observe(t));
    let raf = 0;
    const update = () => {
      raf = 0;
      const first = targets[0], last = targets[targets.length - 1];
      const start = first.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.4;
      const end = last.getBoundingClientRect().bottom + window.scrollY - window.innerHeight * 0.6;
      const p = Math.min(1, Math.max(0, (window.scrollY - start) / Math.max(1, end - start)));
      if (progress.current) progress.current.style.transform = `scaleX(${p.toFixed(4)})`;
      bar.current?.classList.toggle('stuck', (bar.current.getBoundingClientRect().top) <= parseFloat(getComputedStyle(bar.current).top) + 1);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { io.disconnect(); cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [items]);

  // keep the active pill in view inside the horizontal track (without moving the page)
  useEffect(() => {
    const t = track.current, pill = t?.querySelector<HTMLElement>(`[data-id="${CSS.escape(active)}"]`);
    if (!t || !pill) return;
    const left = pill.offsetLeft - t.clientWidth / 2 + pill.offsetWidth / 2;
    t.scrollTo({ left, behavior: 'smooth' });
  }, [active]);

  const go = (e: React.MouseEvent, id: string) => {
    const el = document.getElementById(id); if (!el) return;
    e.preventDefault();
    const head = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pm-head')) || 84;
    const offset = -(head + (bar.current?.offsetHeight ?? 56) + 12);
    // layout position (ignores reveal transforms still in flight), so the jump lands exactly on the chapter
    let top = 0; for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) top += n.offsetTop;
    setActive(id);
    if (window.__lenis) window.__lenis.scrollTo(top + offset);
    else window.scrollTo({ top: top + offset, behavior: 'smooth' });
    history.replaceState(null, '', '#' + id);
  };

  return <nav className="pm-chapters" ref={bar} aria-label={title ?? 'On this page'}>
    <div className="pm-wrap pm-chapters-in">
      {title && <span className="pm-chapters-title">{title}</span>}
      <div className={'pm-chapters-rail' + (edge.l ? ' can-l' : '') + (edge.r ? ' can-r' : '')}>
        <button type="button" className="pm-chapters-arrow l" aria-label="Show previous" tabIndex={edge.l ? 0 : -1} onClick={() => nudge(-1)}><ChevronLeft size={16} /></button>
        <div className="pm-chapters-track" ref={track}>
          {items.map((c, i) => <a key={c.id} href={'#' + c.id} data-id={c.id} className={c.id === active ? 'on' : ''} aria-current={c.id === active ? 'location' : undefined} onClick={e => go(e, c.id)}>
            <span className="pm-num">{String(i + 1).padStart(2, '0')}</span>{c.label}<ArrowDownRight size={13} className="pm-chapters-go" aria-hidden="true" />
          </a>)}
        </div>
        <button type="button" className="pm-chapters-arrow r" aria-label="Show more" tabIndex={edge.r ? 0 : -1} onClick={() => nudge(1)}><ChevronRight size={16} /></button>
      </div>
    </div>
    <span className="pm-chapters-progress" ref={progress} aria-hidden="true" />
  </nav>;
}
