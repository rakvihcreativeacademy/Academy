import type { CSSProperties, ReactNode } from 'react';
import { ArrowDown } from 'lucide-react';
import { heroFontVars } from '@/lib/fonts';
import styles from './NeonHero.module.css';

export type HeroJump = { id: string; label: string };

/**
 * Shared banner for the inner pages (Courses, Podcast Studio, Upcoming, Careers):
 * full-bleed neon photo, giant outlined watermark word, centred headline, and a frosted-glass
 * "jump to" dock floating over the bottom edge (replaces the old tab strip).
 */
export default function NeonHero({ word, pill, title, italic, lede, image, jumps = [], children }: {
  word: string; pill: string; title: string; italic?: string; lede?: string; image: string;
  jumps?: HeroJump[]; children?: ReactNode;
}) {
  return (
    <section className={`${styles.hero} ${heroFontVars}`} data-hero data-dark data-media>
      <div className={styles.media} aria-hidden="true"><img src={image} alt="" fetchPriority="high" decoding="async" /></div>
      <span className={styles.shade} aria-hidden="true" />
      <span className={styles.waves} aria-hidden="true" />

      <div className={`pm-wrap ${styles.inner}`}>
        <span className={styles.pill}><i /> {pill}</span>
        <h1 className={styles.title}>{title}{italic && <> <em>{italic}</em></>}</h1>
        {lede && <p className={styles.lede}>{lede}</p>}
        {children && <div className={styles.actions}>{children}</div>}
      </div>

      {jumps.length > 0 && (
        <nav className={`pm-wrap ${styles.dockWrap}`} aria-label={`${word}: jump to`}>
          <div className={styles.dock}>
            <span className={styles.dockLabel}><ArrowDown size={14} /> Jump to</span>
            <div className={styles.dockLinks}>
              {jumps.map((j, i) => (
                <a key={j.id} href={`#${j.id}`} style={{ '--i': i } as CSSProperties}>
                  <b>{String(i + 1).padStart(2, '0')}</b>{j.label}
                </a>
              ))}
            </div>
          </div>
        </nav>
      )}
    </section>
  );
}
