'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, Award, Calendar, Users, X } from 'lucide-react';
import Link from '@/components/SiteLink';
import { fontVars, heroFontVars } from '@/lib/fonts';
import styles from './LiveCoursePopup.module.css';

const dismissalKey = 'rk-live-course-dismissed-until';

export default function LiveCoursePopup() {
  const [open, setOpen] = useState(false);
  const dismissedUntil = useRef(0);

  useEffect(() => {
    if (open) return;

    let timer: number;
    function schedule() {
      let until = dismissedUntil.current;
      try {
        until = Math.max(until, Number(localStorage.getItem(dismissalKey)) || 0);
      } catch { /* The in-memory timer still works. */ }

      const delay = until - Date.now();
      if (delay > 0 || document.querySelector('.pm-student-auth[open]')) {
        timer = window.setTimeout(schedule, delay > 0 ? delay : 500);
        return;
      }
      setOpen(true);
    }

    timer = window.setTimeout(schedule, 450);
    return () => window.clearTimeout(timer);
  }, [open]);

  const close = () => {
    dismissedUntil.current = Date.now() + 120_000;
    try {
      localStorage.setItem(dismissalKey, String(dismissedUntil.current));
    } catch { /* Keep the dismissal in memory. */ }
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    window.__lenis?.stop();
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.__lenis?.start();
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={`${styles.backdrop} ${fontVars} ${heroFontVars}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pm-promo-title"
      data-lenis-prevent
      onClick={e => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className={styles.frame}>
        <div className={styles.modal}>
          <span className={styles.stars} aria-hidden="true" />
          <span className={styles.lensDeco} aria-hidden="true"><i /><i /><i /></span>
          <button type="button" className={styles.close} aria-label="Close live course announcement" onClick={close}>
            <X size={16} strokeWidth={2.2} />
          </button>

          <div className={styles.body}>
            <span className={styles.live}><b><i /> Live</b> Admissions open</span>
            <h2 id="pm-promo-title" className={styles.title}>
              Professional <em>Video Editing</em>
            </h2>
            <p className={styles.desc}>
              Master Adobe Premiere Pro, colour grading, sound design and real post-production workflows from scratch.
            </p>

            <ul className={styles.points}>
              <li>
                <span className={styles.ico} aria-hidden="true"><Calendar size={17} strokeWidth={2} /></span>
                <div>
                  <strong>45-Days Training Program</strong>
                  <span>Structured hands-on sessions from basics to final delivery</span>
                </div>
              </li>
              <li>
                <span className={styles.ico} aria-hidden="true"><Users size={17} strokeWidth={2} /></span>
                <div>
                  <strong>Live Project Training with Trainer Assistance</strong>
                  <span>Edit a real project with your trainer guiding every stage</span>
                </div>
              </li>
              <li>
                <span className={styles.ico} aria-hidden="true"><Award size={17} strokeWidth={2} /></span>
                <div>
                  <strong>Certificate in 45 days</strong>
                  <span>RAKVIH course-completion certificate when you finish</span>
                </div>
              </li>
            </ul>

            <div className={styles.actions}>
              <Link href="/courses#video-editing" className={styles.primary} onClick={close}>
                View course <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
