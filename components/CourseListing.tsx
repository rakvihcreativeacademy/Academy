'use client';
import { useState } from 'react';
import { Search, ArrowUpRight, X } from 'lucide-react';
import Link from '@/components/SiteLink';
import type { PageContent } from '@/lib/cms/schema';

/** Course catalogue as a run of editorial spreads: plate, title, description and the full module list. */
export default function CourseListing({ sections }: { sections: PageContent['sections'] }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const total = sections.reduce((n, s) => n + s.items.length, 0);
  const filtered = sections.map(section => ({ ...section, items: section.items.filter(item => [item.title, item.description, ...item.details].join(' ').toLowerCase().includes(q)) }));
  const shown = filtered.reduce((n, s) => n + s.items.length, 0);

  return <section className="pm-sec pm-paper" id="course-list">
    <div className="pm-wrap">
      {filtered.map((section, si) => <div key={si}>
        <div className="pm-head-row">
          <div><p className="pm-label rule" style={{ marginBottom: 28 }}>{section.eyebrow}</p><h2 className="pm-h2">{section.title}</h2></div>
          {si === 0 ? <div className="pm-stack" style={{ gap: 18 }}>
            {section.description && <p className="pm-lede">{section.description}</p>}
            <label className="pm-search"><Search size={18} /><input type="search" aria-label="Search courses" placeholder="Search a course or skill…" value={query} onChange={e => setQuery(e.target.value)} />{query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}><X size={16} /></button>}</label>
            <span className="pm-label" role="status">{q ? `${shown} of ${total}` : total} {shown === 1 ? 'course' : 'courses'}</span>
          </div> : section.description ? <p className="pm-lede">{section.description}</p> : <span />}
        </div>
        <div>
          {section.items.map((item, i) => {
            const id = item.slug || `course-${si}-${i}`;
            const details = item.details.filter(Boolean);
            return <article id={id} key={id} className="pm-spread">
              <figure className="pm-plate" data-v>
                <div className="pm-plate-img">{item.image ? <img src={item.image} alt={item.title} loading="lazy" /> : null}</div>
                <figcaption><span>Programme {String(i + 1).padStart(2, '0')}</span><span>RAKVIH Digital</span></figcaption>
              </figure>
              <div className="pm-spread-copy">
                <p className="pm-label"><span className="pm-num pm-olive-text">({String(i + 1).padStart(2, '0')})</span></p>
                <h3>{item.title}</h3>
                {item.description && <p>{item.description}</p>}
                {details.length > 0 && <>
                  <p className="pm-label" style={{ marginTop: 10 }}>What you’ll learn</p>
                  <ul className="pm-modules" data-v>{details.map((d, j) => <li key={j} style={{ '--k': j } as React.CSSProperties}><span className="pm-num">{String(j + 1).padStart(2, '0')}</span>{d}</li>)}</ul>
                </>}
                <div className="pm-row" style={{ marginTop: 8 }}>
                  <Link href={item.href || `/admissions?course=${encodeURIComponent(item.title)}`} className="pm-btn ink">Enquire now <ArrowUpRight size={15} /></Link>
                </div>
              </div>
            </article>;
          })}
        </div>
      </div>)}
      {shown === 0 && <div className="pm-empty"><h3>No courses <em>found.</em></h3><p className="pm-small">Try a different course name, creative skill or software.</p><button type="button" className="pm-btn ink" onClick={() => setQuery('')}>View all courses</button></div>}
    </div>
  </section>;
}
