'use client';
import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import Link from '@/components/SiteLink';

export type ConsoleItem = { title: string; description: string; image: string; href: string };

const FALLBACK = 'Studio, crew and post-production handled end to end — you just show up and talk.';

/**
 * Podcast services as a studio mixing console: a lit display on top shows the selected service;
 * each service is a channel strip (knob, signal LED, level meter, fader and a scribble-strip label).
 * Hover / focus / tap a channel to bring it up on the display.
 */
export default function PodcastConsole({ items }: { items: ConsoleItem[] }) {
  const [on, setOn] = useState(0);
  const cur = items[on] ?? items[0];
  if (!cur) return null;
  const ch = (i: number) => String(i + 1).padStart(2, '0');

  return <div className="pc" data-v>
    <div className="pc-screen" aria-live="polite">
      <div className="pc-shot" key={cur.image + on}><img src={cur.image} alt="" loading="lazy" decoding="async" /></div>
      <div className="pc-read" key={on}>
        <span className="pc-ch"><i aria-hidden="true" />CH {ch(on)} · On air</span>
        <h3>{cur.title}</h3>
        <p>{cur.description || FALLBACK}</p>
        <Link href={cur.href} className="pc-cta">Book this service <ArrowUpRight size={15} /></Link>
      </div>
      <div className="pc-vu" aria-hidden="true">
        {Array.from({ length: 2 }, (_, c) => <span key={c} className="pc-vu-col">
          {Array.from({ length: 14 }, (_, k) => <i key={k} style={{ '--k': k, '--c': c } as React.CSSProperties} />)}
        </span>)}
        <small>L&nbsp;&nbsp;R</small>
      </div>
    </div>

    <div className="pc-desk" role="tablist" aria-label="Podcast services">
      {items.map((it, i) => <button key={it.title} type="button" role="tab" aria-selected={i === on}
        className={'pc-strip' + (i === on ? ' on' : '')} onMouseEnter={() => setOn(i)} onFocus={() => setOn(i)} onClick={() => setOn(i)}>
        <span className="pc-num">{ch(i)}</span>
        <span className="pc-knob" aria-hidden="true" />
        <span className="pc-led" aria-hidden="true" />
        <span className="pc-meter" aria-hidden="true">{Array.from({ length: 10 }, (_, k) => <i key={k} style={{ '--k': k } as React.CSSProperties} />)}</span>
        <span className="pc-fader" aria-hidden="true"><b /></span>
        <span className="pc-tape">{it.title}</span>
      </button>)}
    </div>
  </div>;
}
