'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, AudioLines, Palette, Scissors, Sparkles, type LucideIcon } from 'lucide-react';
import Link from '@/components/SiteLink';
import styles from '@/app/(website)/home-motion.module.css';

type Step = { key: string; label: string; title: string; text: string; video: string; tools: string[]; icon: LucideIcon };

const klickpin = `/${encodeURIComponent('From Klickpin.com- Charming global food memories with charm and ideas with easy charm with beautiful world vibes-pin-id-603623156348724290.mp4')}`;

const steps: Step[] = [
  { key: 'edit', label: 'Edit', icon: Scissors, video: klickpin, title: 'Cut your story together', text: 'Trim, split and arrange clips on the timeline, then shape the pace with transitions and speed changes.', tools: ['Trim', 'Split', 'Speed', 'Transitions'] },
  { key: 'audio', label: 'Audio', icon: AudioLines, video: '/audioediting.mp4', title: 'Make it sound right', text: 'Sync sound to picture, remove noise, balance voices and cut your edit to the beat of the music.', tools: ['Noise removal', 'Beat sync', 'Voice levels'] },
  { key: 'color', label: 'Color', icon: Palette, video: '/coloring.mp4', title: 'Give every shot a look', text: 'Fix exposure and white balance, match your shots, and grade a mood that runs through the whole film.', tools: ['Correction', 'Grading', 'LUTs'] },
  { key: 'effects', label: 'Effects', icon: Sparkles, video: '/Filtering.mp4', title: 'Add the finishing touch', text: 'Layer filters, overlays, titles and motion effects that make your video stand out without overdoing it.', tools: ['Filters', 'Overlays', 'Titles'] },
];

/** each tab plays at most this long before moving to the next one */
const MAX_SECONDS = 9;

/** Filmora-style "simple steps" block: tabs on the left, the matching edit playing on the right. */
export default function EditSteps({ joinHref, joinLabel }: { joinHref: string; joinLabel: string }) {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // only play while the section is on screen
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (!v) return;
      if (i === active && visible) { v.currentTime = 0; v.play().catch(() => {}); }
      else v.pause();
    });
    setProgress(0);
  }, [active, visible]);

  const next = () => setActive(a => (a + 1) % steps.length);
  const onTime = (i: number) => {
    const v = videos.current[i];
    if (!v || i !== active) return;
    const limit = Math.min(v.duration || MAX_SECONDS, MAX_SECONDS);
    const p = v.currentTime / limit;
    if (p >= 1) next(); else setProgress(p);
  };

  const step = steps[active];
  return (
    <div ref={root} className={styles.steps}>
      <div className={styles.stepsSide}>
        <div className={styles.stepTabs} role="tablist" aria-label="Editing steps">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const on = i === active;
            return (
              <button key={s.key} type="button" role="tab" aria-selected={on} className={`${styles.stepTab} ${on ? styles.stepOn : ''}`} onClick={() => setActive(i)}>
                <span className={styles.stepIcon}><Icon size={20} aria-hidden="true" /></span>
                <span className={styles.stepText}>
                  <strong>{s.label}</strong>
                  <span>{s.title}</span>
                </span>
                <span className={styles.stepBar} aria-hidden="true"><i style={{ transform: `scaleX(${on ? progress : 0})` }} /></span>
              </button>
            );
          })}
        </div>
        <Link className={styles.btnSun} href={joinHref}>{joinLabel} <ArrowUpRight size={18} /></Link>
      </div>

      <div className={styles.stepStage} role="tabpanel" aria-label={step.label}>
        <div className={styles.stepFrame}>
          <div className={styles.stepChrome} aria-hidden="true"><i /><i /><i /><span>{step.label}</span></div>
          <div className={styles.stepScreen}>
            {steps.map((s, i) => (
              <video
                key={s.key}
                ref={el => { videos.current[i] = el; }}
                className={i === active ? styles.vidOn : undefined}
                src={s.video}
                muted
                playsInline
                loop={false}
                preload={i === 0 ? 'auto' : 'metadata'}
                onTimeUpdate={() => onTime(i)}
                onEnded={() => i === active && next()}
                aria-hidden={i !== active}
              />
            ))}
          </div>
          <div key={step.key} className={styles.stepPanel}>
            <p>{step.text}</p>
            {step.key === 'audio' && <div className={styles.wave} aria-hidden="true">{Array.from({ length: 28 }, (_, i) => <i key={i} style={{ animationDelay: `${(i % 7) * -0.15}s` }} />)}</div>}
            {step.key === 'color' && <div className={styles.wheels} aria-hidden="true"><i /><i /><i /></div>}
            {step.key === 'effects' && <div className={styles.swatches} aria-hidden="true"><i /><i /><i /><i /><i /></div>}
            {step.key === 'edit' && <div className={styles.miniTimeline} aria-hidden="true"><i /><i /><i /><i /><b /></div>}
            <ul>{step.tools.map(t => <li key={t}>{t}</li>)}</ul>
          </div>
        </div>
      </div>
    </div>
  );
}
