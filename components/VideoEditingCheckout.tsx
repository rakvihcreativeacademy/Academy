'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { CourseOffering } from '@/lib/payments';
import EnrollmentForm from '@/components/EnrollmentForm';

export default function VideoEditingCheckout({
  offering,
  open,
  onClose,
}: {
  offering: CourseOffering;
  open: boolean;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    window.__lenis?.stop();
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.__lenis?.start();
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, busy, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="pm-pay-backdrop pm-site"
      role="dialog"
      aria-modal="true"
      aria-label="Course enrollment and payment"
      data-lenis-prevent
      onClick={e => { if (e.target === e.currentTarget && !busy) onClose(); }}
    >
      <div className="pm-pay-modal wide" data-lenis-prevent>
        <button type="button" className="pm-pay-close" aria-label="Close enrollment window" disabled={busy} onClick={onClose}>
          <X size={18} />
        </button>
        <EnrollmentForm offering={offering} onBusyChange={setBusy} onDone={onClose} />
      </div>
    </div>,
    document.body,
  );
}
