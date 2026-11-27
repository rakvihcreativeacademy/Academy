'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  LogIn,
  Sparkles,
  Users,
  UserPlus,
  X,
} from 'lucide-react';
import Link from '@/components/SiteLink';
import { configured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/client';
import {
  VIDEO_EDITING_SYLLABUS,
  VIDEO_EDITING_SYLLABUS_META,
} from '@/lib/video-editing-syllabus';

export default function VideoEditingDetailsModal({
  open,
  onClose,
  onOpenEnroll,
}: {
  open: boolean;
  onClose: () => void;
  onOpenEnroll?: () => void;
}) {
  const [authLoading, setAuthLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;

    async function checkAuth() {
      if (!configured) {
        if (active) {
          setUserEmail(null);
          setAuthLoading(false);
        }
        return;
      }
      setAuthLoading(true);
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (active) {
          setUserEmail(user?.email ?? null);
          setAuthLoading(false);
        }
      } catch {
        if (active) {
          setUserEmail(null);
          setAuthLoading(false);
        }
      }
    }

    checkAuth();

    if (configured) {
      const supabase = createClient();
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (active) {
          setUserEmail(session?.user?.email ?? null);
          setAuthLoading(false);
        }
      });
      return () => {
        active = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    window.__lenis?.stop();
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.__lenis?.start();
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="pm-pay-backdrop pm-site"
      role="dialog"
      aria-modal="true"
      aria-label="Professional Video Editing Course Details"
      data-lenis-prevent
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={'pm-syl-modal' + (userEmail ? ' is-unlocked' : ' is-locked')}
        data-lenis-prevent
      >
        <button
          type="button"
          className="pm-pay-close"
          aria-label="Close course details"
          onClick={onClose}
        >
          <X size={18} />
        </button>

        {authLoading ? (
          <div className="pm-syl-loading">
            <Loader2 size={28} className="pm-spin" />
            <p>Checking student access…</p>
          </div>
        ) : !userEmail ? (
          /* GATED VIEW — Non-logged-in visitors cannot see syllabus details */
          <div className="pm-syl-gate">
            <div className="pm-syl-lock-badge">
              <LockKeyhole size={26} />
            </div>
            <span className="pm-syl-eyebrow">Registered Students Only</span>
            <h3>Login to View Full Course Details</h3>
            <p className="pm-syl-gate-desc">
              The complete <strong>Adobe Premiere Pro 12-Day Class Schedule</strong>, daily module syllabus, and practical deliverables are exclusively unlocked for registered &amp; logged-in students.
            </p>

            <ul className="pm-syl-gate-perks">
              <li>
                <Calendar size={15} />
                <span>45-Day Training Program</span>
              </li>
              <li>
                <Users size={15} />
                <span>Live Project Training with Trainer Assistance</span>
              </li>
              <li>
                <Award size={15} />
                <span>Get Training Certificate in 45 Days</span>
              </li>
            </ul>

            <div className="pm-syl-gate-actions">
              <Link
                href="/login?next=/courses%23video-editing"
                className="pm-btn"
                onClick={onClose}
              >
                <LogIn size={15} /> Login to View Syllabus
              </Link>
              {onOpenEnroll ? (
                <button
                  type="button"
                  className="pm-btn ghost"
                  onClick={() => {
                    onClose();
                    onOpenEnroll();
                  }}
                >
                  <UserPlus size={15} /> Register &amp; Enroll Now
                </button>
              ) : (
                <Link href="/admissions" className="pm-btn ghost" onClick={onClose}>
                  <UserPlus size={15} /> Register &amp; Enroll Now
                </Link>
              )}
            </div>
            <p className="pm-syl-gate-note">
              Already enrolled? Sign in with your student credentials to unlock the full curriculum popup immediately.
            </p>
          </div>
        ) : (
          /* UNLOCKED VIEW — Full 12-Day Syllabus for Registered & Logged-in Students */
          <div className="pm-syl-content">
            <header className="pm-syl-head">
              <div className="pm-syl-badges">
                <span className="cs-pill is-live">
                  <i aria-hidden="true" />
                  Registered Student Access
                </span>
                <span className="pm-syl-pill">
                  <BookOpen size={12} /> {VIDEO_EDITING_SYLLABUS_META.eyebrow}
                </span>
              </div>
              <h2>{VIDEO_EDITING_SYLLABUS_META.title}</h2>
              <p className="pm-syl-sub">{VIDEO_EDITING_SYLLABUS_META.subtitle}</p>
              <p className="pm-syl-intro">{VIDEO_EDITING_SYLLABUS_META.intro}</p>

              <div className="pm-syl-highlights">
                <span>
                  <Calendar size={14} /> 45-Day Training Program
                </span>
                <span>
                  <Users size={14} /> Live Project Training with Trainer Assistance
                </span>
                <span>
                  <Award size={14} /> Get Training Certificate in 45 Days
                </span>
              </div>
            </header>

            <div className="pm-syl-list">
              {VIDEO_EDITING_SYLLABUS.map((item, idx) => (
                <article key={item.day} className="pm-syl-card">
                  <div className="pm-syl-card-top">
                    <span className="pm-syl-day">
                      {item.day}
                      <small>{String(idx + 1).padStart(2, '0')}/12</small>
                    </span>
                    <h3>{item.module}</h3>
                  </div>

                  <div className="pm-syl-card-grid">
                    <div className="pm-syl-topics">
                      <span className="pm-syl-col-label">Syllabus Topics Covered</span>
                      <ul>
                        {item.topics.map(topic => (
                          <li key={topic}>
                            <CheckCircle2 size={14} />
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pm-syl-deliv">
                      <span className="pm-syl-col-label">
                        <Sparkles size={12} /> Practical Deliverable
                      </span>
                      <p>{item.deliverable}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="pm-syl-pacing">
              <strong>Curriculum Pacing Note:</strong> {VIDEO_EDITING_SYLLABUS_META.pacingNote}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
