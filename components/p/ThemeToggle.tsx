'use client';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { Moon, Sun } from 'lucide-react';

export type Theme = 'dark' | 'light';
const KEY = 'rk-theme';

const current = (): Theme => (typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

function apply(next: Theme) {
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem(KEY, next); } catch { /* private mode: the choice lasts for this page only */ }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#0b0c08' : '#f2efe6');
  window.dispatchEvent(new CustomEvent('rk-theme', { detail: next }));
}

/** Switch theme with a circular reveal that grows from the button (View Transitions when available). */
function switchTheme(next: Theme, from: { x: number; y: number }, set: (t: Theme) => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> } };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!doc.startViewTransition || reduced) { apply(next); set(next); return; }
  const r = Math.hypot(Math.max(from.x, innerWidth - from.x), Math.max(from.y, innerHeight - from.y));
  const html = document.documentElement;
  html.classList.add('theme-vt');
  const vt = doc.startViewTransition(() => { flushSync(() => { apply(next); set(next); }); });
  vt.ready.then(() => {
    html.animate({ clipPath: [`circle(0px at ${from.x}px ${from.y}px)`, `circle(${r}px at ${from.x}px ${from.y}px)`] },
      { duration: 700, easing: 'cubic-bezier(.16,1,.3,1)', pseudoElement: '::view-transition-new(root)' });
  }).catch(() => {});
  vt.finished.finally(() => html.classList.remove('theme-vt'));
}

/** Round sun/moon button for the header. */
export function ThemeButton({ className = '' }: { className?: string }) {
  const [t, setT] = useState<Theme>('dark');
  useEffect(() => {
    setT(current());
    const on = (e: Event) => setT((e as CustomEvent<Theme>).detail);
    window.addEventListener('rk-theme', on);
    return () => window.removeEventListener('rk-theme', on);
  }, []);
  const next: Theme = t === 'dark' ? 'light' : 'dark';
  return <button type="button" className={'pm-theme ' + className} aria-label={`Switch to ${next} theme`} title={`Switch to ${next} theme`}
    onClick={e => { const b = e.currentTarget.getBoundingClientRect(); switchTheme(next, { x: b.left + b.width / 2, y: b.top + b.height / 2 }, setT); }}>
    <span className={'pm-theme-icons' + (t === 'light' ? ' is-light' : '')} aria-hidden="true"><Moon size={16} strokeWidth={1.8} /><Sun size={17} strokeWidth={1.8} /></span>
  </button>;
}

/** Dark / Light segmented control for the mobile menu. */
export function ThemeSwitch() {
  const [t, setT] = useState<Theme>('dark');
  useEffect(() => {
    setT(current());
    const on = (e: Event) => setT((e as CustomEvent<Theme>).detail);
    window.addEventListener('rk-theme', on);
    return () => window.removeEventListener('rk-theme', on);
  }, []);
  const pick = (v: Theme, el: HTMLElement) => { if (v === t) return; const b = el.getBoundingClientRect(); switchTheme(v, { x: b.left + b.width / 2, y: b.top + b.height / 2 }, setT); };
  return <div className="pm-theme-switch" role="radiogroup" aria-label="Appearance">
    <span>Appearance</span>
    <div className={'seg' + (t === 'light' ? ' is-light' : '')}>
      <i aria-hidden="true" />
      <button type="button" role="radio" aria-checked={t === 'dark'} onClick={e => pick('dark', e.currentTarget)}><Moon size={14} strokeWidth={1.9} /> Dark</button>
      <button type="button" role="radio" aria-checked={t === 'light'} onClick={e => pick('light', e.currentTarget)}><Sun size={15} strokeWidth={1.9} /> Light</button>
    </div>
  </div>;
}
