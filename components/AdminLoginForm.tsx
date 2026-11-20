'use client';
import { useState } from 'react';
import { Mail, LockKeyhole, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { authenticate } from '@/actions/auth';

/** Admin sign-in: icon fields, show/hide password, Caps Lock hint, busy state and an inline error. */
export default function AdminLoginForm({ next, disabled }: { next: string; disabled?: boolean }) {
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const keys = (e: React.KeyboardEvent) => setCaps(e.getModifierState?.('CapsLock') ?? false);

  return <form className="al2-form" onSubmit={async e => {
    e.preventDefault(); setBusy(true); setError('');
    try { const r = await authenticate(new FormData(e.currentTarget)); if (r) setError(r.error || r.message || ''); }
    finally { setBusy(false); }
  }}>
    <input type="hidden" name="mode" value="signin" />
    <input type="hidden" name="next" value={next} />
    <label className="al2-field">
      <span>Admin email</span>
      <span className="al2-input"><Mail size={17} aria-hidden="true" /><input type="email" name="email" required autoComplete="username" placeholder="admin@rakvih.in" disabled={disabled} /></span>
    </label>
    <label className="al2-field">
      <span>Password</span>
      <span className="al2-input">
        <LockKeyhole size={17} aria-hidden="true" />
        <input type={show ? 'text' : 'password'} name="password" required minLength={8} maxLength={128} autoComplete="current-password" placeholder="••••••••" onKeyDown={keys} onKeyUp={keys} disabled={disabled} />
        <button type="button" className="al2-eye" onClick={() => setShow(v => !v)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>
      </span>
      {caps && <small className="al2-caps">Caps Lock is on</small>}
    </label>
    {error && <p className="al2-error" role="alert"><AlertCircle size={16} /> {error}</p>}
    <button className="al2-submit" disabled={busy || disabled}>
      {busy ? <><Loader2 size={18} className="spin" /> Signing in…</> : <>Enter the console <span className="arr"><ArrowRight size={17} /></span></>}
    </button>
  </form>;
}
