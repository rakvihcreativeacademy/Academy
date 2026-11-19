'use client';

import { useState } from 'react';
import Link from '@/components/SiteLink';
import Image from 'next/image';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { courses } from '@/lib/courses';
import { courseImages } from '@/lib/course-images';

const groups = [
  { label: 'All disciplines', slugs: [] },
  { label: 'Film & camera', slugs: ['cinematography', 'photography', 'filmmaking'] },
  { label: 'Editing & production', slugs: ['video-editing', 'motion-graphics', 'lighting-sound'] },
  { label: 'Digital & AI', slugs: ['content-creation', 'ai-creative'] },
];

export default function CourseExplorer() {
  const [selected, setSelected] = useState(0);
  const shown = courses.filter(c => selected === 0 || groups[selected].slugs.includes(c.slug));
  return <>
    <div className="ed-course-toolbar"><div className="ed-course-filters" role="group" aria-label="Filter courses by discipline">{groups.map((g, i) => <button key={g.label} type="button" aria-pressed={selected === i} onClick={() => setSelected(i)}>{g.label}</button>)}</div><span>{shown.length.toString().padStart(2, '0')} PROGRAMMES</span></div>
    <div className="ed-course-grid" aria-live="polite">{shown.map(c => <Link key={c.slug} href={`/courses#${c.slug}`} className="ed-course ed-course-with-image">
      <div className="ed-course-photo"><Image src={courseImages[c.slug].src} alt={courseImages[c.slug].alt} fill sizes="(max-width: 600px) 94vw, (max-width: 1000px) 45vw, 24vw" /><span>{c.tag}</span></div>
      <div className="ed-course-content"><p className="ed-course-num">PROGRAMME {c.symbol}<ArrowUpRight size={18} /></p><h3>{c.title}</h3><p>{c.description}</p><div className="ed-course-skills">{c.skills.slice(0, 2).map(s => <span key={s}>{s}</span>)}</div></div>
    </Link>)}</div>
    <div className="ed-course-bottom"><p>Not sure where to start? We’ll help you find your direction.</p><Link href="/admissions">Talk to the academy <ArrowRight size={16} /></Link></div>
  </>;
}
