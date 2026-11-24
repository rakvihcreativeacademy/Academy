'use client';

import { useState, type CSSProperties } from 'react';
import { Check, Headphones, Mic2, Video } from 'lucide-react';
import Link from '@/components/SiteLink';
import styles from './PodcastConsole.module.css';

export type ConsoleItem = { title: string; description: string; image: string; href: string };

export default function PodcastConsole({ items }: { items: ConsoleItem[] }) {
  const [selected, setSelected] = useState(0);
  const current = items[selected] ?? items[0];
  if (!current) return null;

  return <div className={styles.studio}>
    <div className={styles.intro} data-v>
      <p>A space for your voice. A team for your vision.</p>
      <span>Recording, production and post-production — all in one place.</span>
    </div>
    <div className={styles.layout}>
      <div className={styles.feature} data-v>
        <div className={styles.photo}>
          {items.map((item, index) => <img key={`${item.title}-${index}`} src={item.image} alt={selected === index ? item.title : ''} aria-hidden={selected !== index} className={`${styles.frame} ${selected === index ? styles.visible : ''}`} loading="lazy" decoding="async" />)}
          <span className={styles.photoLabel}><Mic2 size={16} /> RAKVIH Podcast Studio</span>
        </div>
        <div className={styles.detail} aria-live="polite">
          <p className={styles.eyebrow}>Your next great conversation starts here</p>
          <div key={selected} className={styles.copy}><h3>{current.title}</h3>
          <p>{current.description || 'Bring your ideas. We’ll help you capture clear sound, beautiful visuals and a finished episode you’re proud to share.'}</p></div>
          <Link href={current.href} className={styles.book}>Enquire about this service</Link>
        </div>
      </div>
      <div className={styles.services}>
        <div className={styles.listHeading} data-v><h3>Make it your own.</h3><p>Explore what we can help you create.</p></div>
        <div className={styles.options} aria-label="Explore podcast services">
          {items.map((item, index) => <button key={item.title} type="button" data-v style={{ '--d': `${(index % 4) * 80}ms` } as CSSProperties} aria-pressed={selected === index} className={`${styles.option} ${selected === index ? styles.active : ''}`} onPointerEnter={(event) => { if (event.pointerType === 'mouse') setSelected(index); }} onFocus={() => setSelected(index)} onClick={() => setSelected(index)}>
            <span className={styles.optionIcon}>{/video|camera|youtube/i.test(item.title) ? <Video size={19} /> : /edit|mix|audio/i.test(item.title) ? <Headphones size={19} /> : <Mic2 size={19} />}</span>
            <span>{item.title}</span>
            <span className={styles.check}>{selected === index && <Check size={17} />}</span>
          </button>)}
        </div>
        <div className={styles.help} data-v><div><strong>Have a format in mind?</strong><p>Ask about hourly, half-day or full-day sessions.</p></div><Link href="#enquire">Let’s talk</Link></div>
      </div>
    </div>
    <div className={styles.steps}>
      <div data-v><Mic2 size={23} /><span><strong>Record with confidence</strong><small>A professional space for your ideas.</small></span></div>
      <div data-v style={{ '--d': '100ms' } as CSSProperties}><Video size={23} /><span><strong>Bring your story to life</strong><small>Audio and video production support.</small></span></div>
      <div data-v style={{ '--d': '200ms' } as CSSProperties}><Headphones size={23} /><span><strong>Leave ready to share</strong><small>Editing that makes every episode shine.</small></span></div>
    </div>
  </div>;
}
