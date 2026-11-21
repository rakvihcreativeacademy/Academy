'use client';
import { useState } from 'react';
import { Search, X, ArrowUpRight } from 'lucide-react';
import Link from '@/components/SiteLink';
import type { DialCourse } from '@/components/p/CourseDial';

/** All programmes at a glance: searchable cards (title, tag, tools, module count) after the dial. */
export default function CourseGlance({ items }: { items: DialCourse[] }) {
  const [q, setQ] = useState('');
  const s = q.trim().toLowerCase();
  const shown = items.filter(c => [c.title, c.tag, c.description, ...c.details, ...c.skills].join(' ').toLowerCase().includes(s));
  return <section className="pm-sec pm-paper pm-glance" id="all-programmes">
    <div className="pm-wrap">
      <div className="pm-head-row">
        <div data-v>
          <p className="pm-label rule" style={{ marginBottom: 20 }}>At a glance</p>
          <h2 className="pm-h2">All eight programmes, <em>side by side.</em></h2>
        </div>
        <div className="pm-stack" style={{ gap: 14 }}>
          <label className="pm-search"><Search size={18} /><input type="search" aria-label="Search courses" placeholder="Search a course, tool or skill…" value={q} onChange={e => setQ(e.target.value)} />{q && <button type="button" aria-label="Clear search" onClick={() => setQ('')}><X size={16} /></button>}</label>
          <span className="pm-label" role="status">{s ? `${shown.length} of ${items.length}` : items.length} programmes</span>
        </div>
      </div>
      <div className="pm-glance-grid">
        {shown.map(c => <a key={c.id} href={'#' + c.id} className="pm-glance-card">
          <span className="pm-glance-img"><img src={c.image} alt="" loading="lazy" /></span>
          <span className="pm-glance-body">
            <span className="pm-glance-tag">{c.tag}</span>
            <b>{c.title}</b>
            <span className="pm-glance-tools">{(c.skills.length ? c.skills : c.details.slice(0, 3)).slice(0, 3).join(' · ')}</span>
            <span className="pm-glance-foot"><span>{c.details.length} modules</span><ArrowUpRight size={16} /></span>
          </span>
        </a>)}
      </div>
      {!shown.length && <div className="pm-empty"><h3>No programmes <em>found.</em></h3><p className="pm-small">Try a different course name, tool or skill.</p><button type="button" className="pm-btn ink" onClick={() => setQ('')}>Show all</button></div>}
      <div className="pm-row" style={{ justifyContent: 'center', marginTop: 34 }}><Link href="/admissions" className="pm-btn ink">Not sure? Get a recommendation <ArrowUpRight size={15} /></Link></div>
    </div>
  </section>;
}
