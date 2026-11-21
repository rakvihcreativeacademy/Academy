"use client";
import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { authenticate } from '@/actions/auth';

export default function AuthForm({
  next = '',
  adminMode = false,
}: {
  next?: string;
  adminMode?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');

  return (
    <form
      className="panel space-y-5"
      onSubmit={async e => {
        e.preventDefault();
        setBusy(true);
        setFeedback('');
        try {
          const result = await authenticate(new FormData(e.currentTarget));
          if (result?.error) setFeedback(result.error);
        } finally {
          setBusy(false);
        }
      }}
    >
      <input type="hidden" name="mode" value="signin" />
      <input type="hidden" name="next" value={next} />

      <label>
        Email
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
      </label>

      <label>
        Password
        <span style={{ position: 'relative', display: 'block' }}>
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            maxLength={128}
            autoComplete="current-password"
            placeholder="Enter your password"
            style={{ width: '100%', paddingRight: 48 }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'grid',
              placeItems: 'center',
              width: 34,
              height: 34,
              borderRadius: '50%',
              border: 0,
              background: 'transparent',
              color: 'var(--pm-mute)',
              cursor: 'pointer',
            }}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </span>
      </label>

      {feedback && (
        <p role="status" className="notice">
          {feedback}
        </p>
      )}

      <button disabled={busy} className="button w-full">
        {busy ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Loader2 size={17} className="pm-spin" /> Signing in…
          </span>
        ) : adminMode ? (
          'Sign in to admin panel ↗'
        ) : (
          'Sign in to your studio ↗'
        )}
      </button>
    </form>
  );
}
