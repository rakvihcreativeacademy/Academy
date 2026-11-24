'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowUpRight, House, LogIn } from 'lucide-react';
import Link from '@/components/SiteLink';
import { nav, site } from '@/lib/site';
import { ThemeButton, ThemeSwitch } from '@/components/p/ThemeToggle';

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;
// '/projects' (Student Work) is hidden from the header for now — the page itself still works. Remove it here to show it again.
const hiddenInHeader = new Set(['/about', '/projects']);
const headerNav = nav.filter(l => !hiddenInHeader.has(l.href));

/** Masthead: brand · glass nav capsule (with a dedicated Home button and a sliding active pill) · Apply. */
export default function Masthead() {
  const [path, setPath] = useState('');
  const [open, setOpen] = useState(false);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);
  const [glide, setGlide] = useState(false); // no slide on page load — the pill appears in place, then glides on hover
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const capsule = useRef<HTMLElement>(null);

  useEffect(() => { setPath(window.location.pathname); }, []);
  const active = (href: string) => href === '/' ? path === '/' : path === href || path.startsWith(href + '/');

  // Sliding pill: sits under the current page, glides to whichever item is hovered.
  const place = (el: HTMLElement | null | undefined) => {
    if (!el || !capsule.current) { setPill(null); return; }
    const c = capsule.current.getBoundingClientRect(), r = el.getBoundingClientRect();
    setPill({ x: r.left - c.left, w: r.width });
  };
  const home = () => place(capsule.current?.querySelector<HTMLElement>('a[aria-current="page"]'));
  useIso(() => { home(); const f = () => home(); window.addEventListener('resize', f); document.fonts?.ready.then(f); const t = window.setTimeout(() => setGlide(true), 400); return () => { window.removeEventListener('resize', f); clearTimeout(t); }; }, [path]);

  useEffect(() => {
    if (!open) return;
    window.__lenis?.stop();
    const root = document.documentElement, hadMedia = root.classList.contains('hdr-media');
    root.classList.remove('hdr-media');
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    const close = () => { setOpen(false); btn.current?.focus(); };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      const items = [btn.current, ...Array.from(panel.current?.querySelectorAll<HTMLElement>('a[href]') ?? [])].filter(Boolean) as HTMLElement[];
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    const onResize = () => { if (window.innerWidth > 1240) setOpen(false); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => { window.__lenis?.start(); document.documentElement.style.overflow = prev; if (hadMedia) root.classList.add('hdr-media'); window.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); };
  }, [open]);

  return <>
    <header className="pm-head">
      <Link href="/" className="pm-brand" aria-label={`${site.name} — home`}>
        <span className="pm-logo-lockup"><img className="pm-logo" src="/brand/rakvih-logo.png" alt="RAKVIH Solutions Private Limited" width={1052} height={374} /><span className="pm-logo-name">Rakvih <b>Digital</b></span></span>
      </Link>
      <nav className="pm-nav" aria-label="Main" ref={capsule} onMouseLeave={home}>
        <span className={'pm-nav-pill' + (glide ? ' glide' : '')} aria-hidden="true" style={pill ? { transform: `translateX(${pill.x}px)`, width: pill.w, opacity: 1 } : { opacity: 0 }} />
        {headerNav.map(l => <Link key={l.href} href={l.href} className={(active(l.href) ? 'active ' : '') + (l.href === '/' ? 'home' : '') + (l.href === '/production' ? ' has-badge' : '')}
          aria-current={active(l.href) ? 'page' : undefined} onMouseEnter={e => place(e.currentTarget)} onFocus={e => place(e.currentTarget)}>
          {l.href === '/' ? <><House size={14} strokeWidth={1.6} />Home</> : l.href === '/production' ? <span className="pm-nav-stack"><span>{l.label}</span><small className="pm-nav-badge">Upcoming</small></span> : l.label}
        </Link>)}
      </nav>
      <div className="pm-head-actions">
        <ThemeButton />
        <Link href="/login" className="pm-head-login" aria-label="Student login"><LogIn size={14} strokeWidth={2} /> <span>Login</span></Link>
        <Link href="/admissions" className="pm-btn sm">Apply now <ArrowUpRight size={14} /></Link>
        <button ref={btn} type="button" className="pm-burger" aria-expanded={open} aria-controls="pm-menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(o => !o)}>
          <span>{open ? 'Close' : 'Menu'}</span><i aria-hidden="true" />
        </button>
      </div>
    </header>
    {open && <div className="pm-menu" id="pm-menu" ref={panel} role="dialog" aria-modal="true" aria-label="Site menu">
      <p className="pm-menu-kicker"><span className="pm-dot" /> Menu</p>
      <nav className="pm-menu-nav" aria-label="Mobile">
        {headerNav.map((l, i) => {
          const on = active(l.href);
          return <Link key={l.href} href={l.href} className={'pm-menu-link' + (on ? ' active' : '')} aria-current={on ? 'page' : undefined}
            style={{ '--i': i } as React.CSSProperties} onClick={() => setOpen(false)}>
            <span>{l.href === '/' && <House size={18} strokeWidth={1.8} />}<span className="pm-menu-stack"><span>{l.label}</span>{l.href === '/production' && <small className="pm-nav-badge">Upcoming</small>}</span></span>
            {on ? <i className="pm-menu-here">You’re here</i> : <ArrowUpRight size={18} className="pm-menu-arrow" />}
          </Link>;
        })}
      </nav>
      <div className="pm-menu-foot">
        <ThemeSwitch />
        <div className="pm-menu-cta">
          <Link href="/admissions" className="pm-btn" onClick={() => setOpen(false)}>Apply now <ArrowUpRight size={14} /></Link>
          <Link href="/login" className="pm-btn ghost on-dark pm-menu-login" onClick={() => setOpen(false)}><LogIn size={15} /> Login</Link>
        </div>
        <div className="pm-menu-meta">
          <span>{site.whatsappDisplay}</span>
          <span>{site.location.split(',')[0]}, India</span>
        </div>
      </div>
    </div>}
  </>;
}
