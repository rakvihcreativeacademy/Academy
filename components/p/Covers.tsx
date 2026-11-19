'use client';
import { useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const roles = [
  { title: 'Video Editor', img: '/images/academy-editing.webp', text: 'Shape raw footage into stories — for films, brands, YouTube channels and social media.' },
  { title: 'Cinematographer', img: '/images/course-cinematography.webp', text: 'Design the look of a film with light, lenses, framing and camera movement.' },
  { title: 'Photographer', img: '/images/academy-photography.webp', text: 'Create portraits, product, event and wedding images with your own visual style.' },
  { title: 'Motion Graphics Designer', img: '/images/course-motion-graphics.webp', text: 'Bring titles, logos and ideas to life with animation and visual effects.' },
  { title: 'Content Creator', img: '/images/course-content-creation.webp', text: 'Plan, shoot and edit content that grows an audience — for yourself or for brands.' },
  { title: 'Podcast Producer', img: '/images/academy-studio.webp', text: 'Run recordings, manage audio and video, and deliver finished podcast episodes.' },
];

/** Career paths as a run of magazine covers. */
export default function Covers({ note }: { note?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const go = (dir: number) => {
    const t = track.current; if (!t) return;
    const w = (t.firstElementChild as HTMLElement | null)?.offsetWidth ?? 320;
    t.scrollBy({ left: dir * (w + 20), behavior: 'smooth' });
  };
  return <>
    <div className="pm-covers" ref={track} tabIndex={0} aria-label="Career paths">
      {roles.map((r, i) => <article key={r.title} className="pm-cover" data-v>
        <img src={r.img} alt="" loading="lazy" />
        <div className="pm-cover-top"><b>RAKVIH</b><span className="pm-num">Career Nº {String(i + 1).padStart(2, '0')}</span></div>
        <div className="pm-cover-body"><h3>{r.title}</h3><p>{r.text}</p></div>
      </article>)}
    </div>
    <div className="pm-cover-nav">
      {note && <p className="pm-fine">{note}</p>}
      <div className="arrows"><button type="button" onClick={() => go(-1)} aria-label="Previous career"><ArrowLeft size={18} /></button><button type="button" onClick={() => go(1)} aria-label="Next career"><ArrowRight size={18} /></button></div>
    </div>
  </>;
}
