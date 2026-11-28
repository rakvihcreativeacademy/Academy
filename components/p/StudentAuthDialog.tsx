'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import AuthForm from '@/components/AuthForm';

export type StudentAuthMode = 'login' | 'register';

export default function StudentAuthDialog({ mode, onChange, onClose }: {
  mode: StudentAuthMode;
  onChange: (mode: StudentAuthMode) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const registering = mode === 'register';

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="pm-student-auth"
      aria-labelledby="student-auth-title"
      data-lenis-prevent
      onClose={event => {
        if (!event.currentTarget.open) onClose();
      }}
      onClick={event => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      <div className="pm-student-auth-layout">
        <img className="pm-student-auth-image" src={registering ? "/images/banners/neon-register.jpg" : "/images/banners/neon-login.jpg"} alt="" />
        <div className="pm-student-auth-body lg-card">
          <button type="button" className="pm-student-auth-close" aria-label="Close" onClick={() => dialogRef.current?.close()}>
            <X size={20} />
          </button>
          <h2 id="student-auth-title">{registering ? 'Create your student account' : 'Student login'}</h2>
          <AuthForm key={mode} registerMode={registering} />
          <div className="lg-foot">
            <span>{registering ? 'Already have an account?' : 'New to the student portal?'}</span>
            <button type="button" className="pm-link" onClick={() => onChange(registering ? 'login' : 'register')}>
              {registering ? 'Sign in' : 'Register'}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
