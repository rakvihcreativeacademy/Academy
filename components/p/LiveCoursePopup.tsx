'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Award, Calendar, Users, X } from 'lucide-react';
import Link from '@/components/SiteLink';

/**
 * Homepage spotlight popup for the Live Professional Video Editing course.
 * Appears every time the home page loads or refreshes.
 * Split layout: cinematic banner on the left, course highlights + Read More button on the right.
 */
export default function LiveCoursePopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname !== '/') {
      setOpen(false);
      return;
    }
    const timer = window.setTimeout(() => setOpen(true), 450);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  const close = () => setOpen(false);

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
      className="pm-promo-backdrop pm-site"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pm-promo-title"
      data-lenis-prevent
      onClick={e => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="pm-promo-modal" data-lenis-prevent>
        <button
          type="button"
          className="pm-promo-close"
          aria-label="Close live course announcement"
          onClick={close}
        >
          <X size={18} strokeWidth={2.2} />
        </button>

        {/* Left Side: Live Course Banner */}
        <div className="pm-promo-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/banners/home-editing-first-v2.webp"
            alt="Professional Video Editing studio training at RAKVIH Digital"
          />
          <div className="pm-promo-media-shade" aria-hidden="true" />
          <span className="pm-promo-live-pill">
            <i aria-hidden="true" />
            Live Course · Enrolling Now
          </span>
          <div className="pm-promo-media-foot">
            <span>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" style={{ borderRadius: 5, boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                <rect width="24" height="24" rx="5" fill="#00005B" />
                <text x="12" y="16" textAnchor="middle" fill="#9999FF" fontSize="11.5" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">Pr</text>
              </svg>
              Adobe Premiere Pro
            </span>
            <strong>45 days Intensive Studio Program</strong>
          </div>
        </div>

        {/* Right Side: Course Contents & Read More CTA */}
        <div className="pm-promo-body">
          <p className="pm-promo-eyebrow">Now Live at RAKVIH Solutions Private Limited</p>
          <h2 id="pm-promo-title" className="pm-promo-title">
            Professional <em>Video Editing</em>
          </h2>
          <p className="pm-promo-desc">
            Admissions are live! Master Adobe Premiere Pro, color grading, sound design, and real studio post-production workflows from scratch.
          </p>

          <ul className="pm-promo-points">
            <li>
              <span className="pm-promo-ico" aria-hidden="true">
                <Calendar size={17} strokeWidth={2} />
              </span>
              <div className="pm-promo-pt-copy">
                <strong>45 days Training Program</strong>
                <span>Structured hands-on sessions from basics to pro delivery</span>
              </div>
            </li>
            <li>
              <span className="pm-promo-ico" aria-hidden="true">
                <Users size={17} strokeWidth={2} />
              </span>
              <div className="pm-promo-pt-copy">
                <strong>Live Project Training with Trainer Assistance</strong>
                <span>Edit real commercial &amp; film projects with dedicated mentors</span>
              </div>
            </li>
            <li>
              <span className="pm-promo-ico" aria-hidden="true">
                <Award size={17} strokeWidth={2} />
              </span>
              <div className="pm-promo-pt-copy">
                <strong>Get Training Certificate in 45 days</strong>
                <span>Industry-recognized completion certificate upon finishing</span>
              </div>
            </li>
          </ul>

          <div className="pm-promo-actions">
            <Link
              href="/courses#video-editing"
              className="pm-btn pm-promo-readmore"
              onClick={close}
            >
              Read More <ArrowUpRight size={16} />
            </Link>
            <button type="button" className="pm-promo-dismiss" onClick={close}>
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
