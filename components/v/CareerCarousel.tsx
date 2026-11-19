'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const roles = [
  { title: 'Video Editor', img: '/images/academy-editing.webp', text: 'Shape raw footage into stories — for films, brands, YouTube channels and social media.', tone: 'green' },
  { title: 'Cinematographer', img: '/images/course-cinematography.webp', text: 'Design the look of a film with light, lenses, framing and camera movement.', tone: 'amber' },
  { title: 'Photographer', img: '/images/academy-photography.webp', text: 'Create portraits, product, event and wedding images with your own visual style.', tone: 'olive' },
  { title: 'Motion Graphics Designer', img: '/images/course-motion-graphics.webp', text: 'Bring titles, logos and ideas to life with animation and visual effects.', tone: 'green' },
  { title: 'Content Creator', img: '/images/course-content-creation.webp', text: 'Plan, shoot and edit content that grows an audience — for yourself or for brands.', tone: 'amber' },
  { title: 'Podcast Producer', img: '/images/academy-studio.webp', text: 'Run recordings, manage audio and video, and deliver finished podcast episodes.', tone: 'olive' },
];
const loop = [...roles, ...roles];
const SPEED = 0.45; // px per frame — a slow, continuous drift

export default function CareerCarousel() {
  const track = useRef<HTMLDivElement>(null);
  const hold = useRef(false);
  const resumeAt = useRef(0);
  const pos = useRef(0);
  const [a, setA] = useState(0);

  useEffect(() => {
    const t = track.current; if (!t) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const step = () => {
      const half = t.scrollWidth / 2;
      if (!hold.current && performance.now() > resumeAt.current) {
        pos.current += SPEED;
        if (pos.current >= half) pos.current -= half;
        t.scrollLeft = pos.current;
      } else pos.current = t.scrollLeft % half;
      const w = (t.children[0] as HTMLElement).offsetWidth + 14;
      setA(Math.round(t.scrollLeft / w) % roles.length);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const go = (n: number) => {
    const t = track.current; if (!t) return;
    const i = ((n % roles.length) + roles.length) % roles.length;
    const el = t.children[i] as HTMLElement;
    resumeAt.current = performance.now() + 5000;
    t.scrollTo({ left: el.offsetLeft - t.offsetLeft, behavior: 'smooth' });
  };
  const pause = () => { hold.current = true; };
  const play = () => { hold.current = false; resumeAt.current = performance.now() + 1200; };

  return <div className="v-careers">
    <div className="v-careers-track auto" ref={track} onMouseEnter={pause} onMouseLeave={play} onTouchStart={pause} onTouchEnd={play} onFocus={pause} onBlur={play}>
      {loop.map((r, i) => <article key={i} className={'v-career t-' + r.tone} aria-hidden={i >= roles.length} aria-roledescription="slide" aria-label={`${(i % roles.length) + 1} of ${roles.length}`}>
        <div className="v-career-text"><span className="v-career-mark">Career path {String((i % roles.length) + 1).padStart(2, '0')}</span><strong>{r.title}</strong><p>{r.text}</p></div>
        <div className="v-career-img"><Image src={r.img} alt="" fill sizes="(max-width: 700px) 80vw, 260px" /></div>
      </article>)}
    </div>
    <div className="v-careers-nav">
      <div className="v-careers-nums"><span className="v-ring" aria-hidden="true" />{roles.map((r, i) => <button key={r.title} type="button" className={i === a ? 'on' : ''} onClick={() => go(i)} aria-label={`Show ${r.title}`}>{String(i + 1).padStart(2, '0')}</button>)}</div>
      <div className="v-careers-arrows"><button type="button" onClick={() => go(a - 1)} aria-label="Previous"><ArrowLeft size={16} /></button><button type="button" className="on" onClick={() => go(a + 1)} aria-label="Next"><ArrowRight size={16} /></button></div>
    </div>
  </div>;
}
