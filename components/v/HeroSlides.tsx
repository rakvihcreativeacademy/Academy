'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { GraduationCap, Mic, Award, ArrowUpRight, MessageCircle } from 'lucide-react';
import Link from '@/components/SiteLink';
import { site, whatsappLink } from '@/lib/site';
import Words from '@/components/v/Words';

const slides = [
  { src: '/images/academy-filmmaking.webp', alt: 'Illustration of students working together on a professional film camera', title: 'Filmmaking', sub: 'Cinematography & direction' },
  { src: '/images/banners/editing-colour.webp', alt: 'Colourist grading a film using a professional control panel', title: 'Video editing', sub: 'Editing, grading & reels' },
  { src: '/images/academy-studio.webp', alt: 'Illustration of a podcast studio with microphones and armchairs', title: 'Podcast studio', sub: 'Record, film & produce' },
];
const DURATION = 6000;

export default function HeroSlides() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(() => setI(n => (n + 1) % slides.length), DURATION);
    return () => clearTimeout(t);
  }, [i, paused]);

  return <section className="v-hb rk-hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
    <div className="v-hb-media" aria-hidden="true">
      {slides.map((s, n) => <Image key={s.src} src={s.src} alt="" fill priority={n === 0} sizes="100vw" className={n === i ? 'on' : ''} />)}
    </div>
    <div className="v-hb-shade" aria-hidden="true" />
    <div className="v-hb-grain" aria-hidden="true" />
    <div className="rk-hero-lines" aria-hidden="true"><i /><i /><i /></div>

    <div className="v-hb-inner">
      <div className="v-hb-copy" data-v>
        <p className="v-hb-badge"><span />RAKVIH Creative Academy · Bengaluru</p>
        <h1><Words text="Turn your creativity" /><br /><em><Words text="into your career." start={3} /></em></h1>
        <p className="v-hb-lede">Professional training in video editing, cinematography, photography and filmmaking — with a premium podcast studio and real production work under one roof.</p>
        <div className="v-row rk-hero-cta">
          <Link href="/courses" className="v-pill-sun rk-btn">Explore courses <ArrowUpRight size={16} /></Link>
          <a href={whatsappLink(`Hello ${site.name}, I’d like to know more about your courses.`)} target="_blank" rel="noopener noreferrer" className="v-pill-ghost rk-btn"><MessageCircle size={16} /> Talk to an advisor</a>
        </div>
        <ul className="v-hb-facts">
          <li><GraduationCap size={16} />8 professional courses</li>
          <li><Mic size={16} />Premium podcast studio</li>
          <li><Award size={16} />Course-completion certificate</li>
        </ul>
      </div>

      <div className="v-hb-side" aria-hidden="true">
        <div className="rk-orbit-badge" data-depth="1.4">
          <svg viewBox="0 0 200 200"><defs><path id="rkCircle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
            <text><textPath href="#rkCircle">Learn the art ✦ Master the technology ✦ Create your future ✦</textPath></text></svg>
          <img src="/brand/rakvih-mark-128.png" alt="" />
        </div>
        <div className="v-hb-onair" data-depth="-1">
          <span className="v-hb-rec"><i />On air</span>
          <div className="v-hb-eq">{Array.from({ length: 16 }, (_, k) => <i key={k} style={{ '--i': k } as React.CSSProperties} />)}</div>
          <small>Create · Capture · Edit · Inspire</small>
        </div>
      </div>
    </div>

    <div className="v-hb-tabs" role="tablist" aria-label="Hero images">
      {slides.map((s, n) => <button key={s.src} type="button" role="tab" aria-selected={n === i} onClick={() => setI(n)} className={paused && n === i ? 'paused' : ''}>
        <span className="v-hb-thumb"><Image src={s.src} alt="" fill sizes="64px" /></span>
        <span className="v-hb-tab-text"><b>{String(n + 1).padStart(2, '0')} · {s.title}</b><small>{s.sub}</small></span>
        <span className="v-hb-bar"><i key={n === i ? `on-${i}` : 'off'} style={{ animationDuration: `${DURATION}ms` }} /></span>
      </button>)}
    </div>
    <p className="sr-only" aria-live="polite">{slides[i].alt}</p>
  </section>;
}
