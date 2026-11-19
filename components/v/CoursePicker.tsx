'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from '@/components/SiteLink';
import { ArrowUpRight } from 'lucide-react';
import { courses } from '@/lib/courses';
import { courseImages } from '@/lib/course-images';

export default function CoursePicker() {
  const [a, setA] = useState(0);
  const c = courses[a];
  return <div className="v-picker">
    <div className="v-picker-copy" data-v>
      <p className="v-eyebrow">Eight professional courses</p>
      <h2>Find the course your <em>creative side</em> needs.</h2>
      <div className="v-picker-detail" key={c.slug} aria-live="polite">
        <p className="v-picker-num">Programme {c.symbol} · {c.tag}</p>
        <h3>{c.title}</h3>
        <p>{c.description}</p>
        <ul>{c.skills.map(s => <li key={s}>{s}</li>)}</ul>
      </div>
      <div className="v-row">
        <Link href={`/courses#${c.slug}`} className="v-pill-outline">View curriculum <ArrowUpRight size={15} /></Link>
        <Link href={`/admissions?course=${encodeURIComponent(c.title)}`} className="v-pill-dark">Enquire <ArrowUpRight size={15} /></Link>
      </div>
    </div>
    <div className="v-picker-media" data-v data-cursor="View">
      <div className="v-picker-main">
        {courses.map((x, i) => <Image key={x.slug} src={courseImages[x.slug].src} alt={courseImages[x.slug].alt} fill sizes="(max-width: 900px) 92vw, 46vw" className={i === a ? 'on' : ''} aria-hidden={i !== a} />)}
        <span className="v-glass-tag"><img src="/brand/rakvih-mark-128.png" alt="" />{c.title}</span>
      </div>
      <div className="v-picker-thumbs" role="tablist" aria-label="Choose a course">
        {courses.map((x, i) => <button key={x.slug} type="button" role="tab" aria-selected={i === a} onClick={() => setA(i)} title={x.title}>
          <Image src={courseImages[x.slug].src} alt="" fill sizes="120px" /><span>{x.symbol}</span>
        </button>)}
      </div>
    </div>
  </div>;
}
