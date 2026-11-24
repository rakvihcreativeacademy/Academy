'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import Link from '@/components/SiteLink';
import styles from './EditingStage.module.css';

const frames = [
  { src: '/images/editing-frames/mountain-film.webp', alt: 'Sunrise over misty mountain ridges' },
  { src: '/images/editing-frames/city-film.webp', alt: 'Rainy city street at blue hour' },
  { src: '/images/editing-frames/dance-film.webp', alt: 'Dancer moving through a sunlit heritage courtyard' },
  { src: '/images/editing-frames/ocean-film.webp', alt: 'Ocean waves breaking on a dramatic rocky coastline' },
];

const steps = [
  { title: 'Cut', text: 'Pacing, rhythm and story structure' },
  { title: 'Colour', text: 'Grading that sets the mood' },
  { title: 'Sound', text: 'Mixing, music and sound design' },
];

export default function EditingStage() {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let raf = 0;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      raf = 0;
      const rect = element.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - window.innerHeight)));
      element.style.setProperty('--edit-progress', String(motion.matches ? 1 : progress));
      setActive(Math.min(frames.length - 1, Math.floor(progress * frames.length)));
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); motion.removeEventListener('change', schedule); };
  }, []);

  return <section ref={root} className={styles.section} aria-labelledby="editing-stage-title" data-dark>
    <div className={styles.sticky}>
      <header className={styles.header}><p>Editing</p><span>Post-production · Every frame matters</span></header>
      <div className={styles.frame}>
        <div className={styles.editScene}>
          <div className={styles.preview}>
            <span className={styles.previewTop}>PROGRAMME / FINAL CUT <b>4K</b></span>
            <div className={styles.previewImages}>{frames.map((frame, i) => <img key={frame.src} src={frame.src} alt={i === active ? frame.alt : ''} aria-hidden={i !== active} className={i === active ? styles.currentFrame : ''} loading="lazy" decoding="async" />)}</div>
          </div>
          <div className={styles.flyingFrames} aria-hidden="true">{frames.map((frame, i) => <div key={frame.src} className={styles.filmCard} style={{ '--frame-index': i } as CSSProperties}><img src={frame.src} alt="" loading="lazy" /><span>CLIP {String(i + 1).padStart(2, '0')}</span></div>)}</div>
          <div className={styles.editTimeline} aria-hidden="true"><span className={styles.timelineTitle}>RAKVIH / TIMELINE</span><div className={styles.videoLane}><b>V1</b>{frames.map(frame => <img key={frame.src} src={frame.src} alt="" loading="lazy" />)}</div><div className={styles.audioLane}><b>A1</b><span /></div><i className={styles.playhead} /></div>
        </div>
        <div className={styles.hud} aria-hidden="true"><span><i /> Edit suite</span><span>4K / 24 FPS</span></div>
        <div className={styles.copy}>
          <p className={styles.label}><i aria-hidden="true" />Every frame has a purpose.</p>
          <h2 id="editing-stage-title">Find the story.<br /><em>Make the cut.</em></h2>
          <p className={styles.lead}>Editing, colour and sound. Turn raw footage into something unforgettable.</p>
          <ul className={styles.steps}>
            {steps.map((step, i) => <li key={step.title} className={i === Math.min(active, steps.length - 1) ? styles.stepOn : ''}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <div><b>{step.title}</b><small>{step.text}</small></div>
            </li>)}
          </ul>
          <Link href="/courses#video-editing" className={styles.cta}>Explore video editing <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </div>
        <div className={styles.track} aria-hidden="true"><span>V1</span><i /><i /><i /><i /><b /></div>
      </div>
      <footer className={styles.footer}><span>Cut · Colour · Sound · Deliver</span><span>Scroll to explore the edit</span></footer>
    </div>
  </section>;
}
