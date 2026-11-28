'use client';
import DigitalWordmark from './DigitalWordmark';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  ChevronDown,
  CalendarDays,
  GraduationCap,
  House,
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageCircle,
  Mic,
  Briefcase,
} from 'lucide-react';
import Link from '@/components/SiteLink';
import StudentAuthDialog, { type StudentAuthMode } from './StudentAuthDialog';
import { nav, site } from '@/lib/site';
import { configured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/client';

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;
// '/projects' (Student Work) is hidden from the header for now — the page itself still works. Remove it here to show it again.
const hiddenInHeader = new Set(['/about', '/projects']);
const headerNav = nav.filter(l => !hiddenInHeader.has(l.href));
const NAV_ICONS: Record<string, typeof House> = { '/': House, '/courses': GraduationCap, '/podcast-studio': Mic, '/upcoming': CalendarDays, '/careers': Briefcase, '/contact': MessageCircle };

type LoggedInStudent = {
  email: string;
  name: string;
  initials: string;
};

function toStudent(user: { email?: string | null; user_metadata?: Record<string, unknown> } | null): LoggedInStudent | null {
  if (!user?.email) return null;
  const metaName =
    (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name.trim()) ||
    (typeof user.user_metadata?.name === 'string' && user.user_metadata.name.trim()) ||
    '';
  const fallbackName = user.email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const name = metaName || fallbackName || 'Student';
  const parts = name.split(/\s+/).filter(Boolean);
  const initials = (parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2)).toUpperCase();
  return { email: user.email, name, initials };
}

/** Masthead: brand · glass nav capsule (with a dedicated Home button and a sliding active pill) · Account / Apply. */
export default function Masthead() {
  const router = useRouter();
  const [path, setPath] = useState('');
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [authMode, setAuthMode] = useState<StudentAuthMode | null>(null);

  useEffect(() => setAuthMode(null), [pathname]);

  const openAuth = (mode: StudentAuthMode) => {
    setOpen(false);
    setAuthMode(mode);
  };
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [student, setStudent] = useState<LoggedInStudent | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);
  const [glide, setGlide] = useState(false); // no slide on page load — the pill appears in place, then glides on hover
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const capsule = useRef<HTMLElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setPath(window.location.pathname); }, []);
  const active = (href: string) => href === '/' ? path === '/' : path === href || path.startsWith(href + '/');

  // Detect signed-in student via Supabase auth and stay synced across login/logout
  useEffect(() => {
    if (!configured) return;
    let activeFlag = true;
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (activeFlag) setStudent(toStudent(user));
    }).catch(() => {
      if (activeFlag) setStudent(null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (activeFlag) setStudent(toStudent(session?.user ?? null));
    });

    return () => {
      activeFlag = false;
      subscription.unsubscribe();
    };
  }, []);

  // Close user dropdown on outside click or Escape
  useEffect(() => {
    if (!userMenuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUserMenuOpen(false);
    };
    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [userMenuOpen]);

  const handleSignOut = async () => {
    if (!configured || signingOut) return;
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setStudent(null);
      setUserMenuOpen(false);
      setOpen(false);
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

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
      const items = [btn.current, ...Array.from(panel.current?.querySelectorAll<HTMLElement>('a[href],button') ?? [])].filter(Boolean) as HTMLElement[];
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    const onResize = () => { if (window.innerWidth > 1240) setOpen(false); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => { window.__lenis?.start(); document.documentElement.style.overflow = prev; if (hadMedia) root.classList.add('hdr-media'); window.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); };
  }, [open]);

  const firstName = student?.name.split(/\s+/)[0] || 'Student';

  return <>
    {authMode && !student && <StudentAuthDialog mode={authMode} onChange={setAuthMode} onClose={() => setAuthMode(null)} />}
    <header className="pm-head">
      <Link href="/" className="pm-brand" aria-label={`${site.name} — home`}>
        <DigitalWordmark />
      </Link>
      <nav className="pm-nav" aria-label="Main" ref={capsule} onMouseLeave={home}>
        <span className={'pm-nav-pill' + (glide ? ' glide' : '')} aria-hidden="true" style={pill ? { transform: `translateX(${pill.x}px)`, width: pill.w, opacity: 1 } : { opacity: 0 }} />
        {headerNav.map(l => <Link key={l.href} href={l.href} className={(active(l.href) ? 'active ' : '') + (l.href === '/' ? 'home' : '')}
          aria-current={active(l.href) ? 'page' : undefined} onMouseEnter={e => place(e.currentTarget)} onFocus={e => place(e.currentTarget)}>
          {(() => { const Icon = NAV_ICONS[l.href]; return Icon ? <Icon size={14} strokeWidth={1.7} className="pm-nav-ico" aria-hidden="true" /> : null; })()}
          {l.label}
        </Link>)}
      </nav>
      <div className="pm-head-actions">
        {student ? (
          <div className="pm-user-wrap" ref={userMenuRef}>
            <button
              type="button"
              className={'pm-head-user' + (userMenuOpen ? ' open' : '')}
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
              aria-label="Student account menu"
              onClick={() => setUserMenuOpen(v => !v)}
            >
              <span className="pm-user-av" aria-hidden="true">{student.initials}</span>
              <span className="pm-user-name">{firstName}</span>
              <ChevronDown size={14} className="pm-user-chev" aria-hidden="true" />
            </button>

            {userMenuOpen && (
              <div className="pm-user-drop" role="menu" aria-label="Student account details">
                <div className="pm-user-drop-head">
                  <span className="pm-user-av lg" aria-hidden="true">{student.initials}</span>
                  <div className="pm-user-meta">
                    <span className="pm-user-status"><i aria-hidden="true" /> Signed in</span>
                    <strong>{student.name}</strong>
                    <small>{student.email}</small>
                  </div>
                </div>

                <div className="pm-user-drop-foot">
                  <button
                    type="button"
                    role="menuitem"
                    className="pm-user-signout"
                    disabled={signingOut}
                    onClick={handleSignOut}
                  >
                    <LogOut size={15} />
                    <span>{signingOut ? 'Signing out…' : 'Sign Out'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button type="button" className="pm-head-login" aria-haspopup="dialog" onClick={() => openAuth('login')}><LogIn size={14} strokeWidth={2} /> <span>Login</span></button>
        )}
        {!student && <button type="button" className="pm-btn sm" aria-haspopup="dialog" onClick={() => openAuth('register')}>Register <ArrowUpRight size={14} /></button>}
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
            <span>{l.href === '/' && <House size={18} strokeWidth={1.8} />}<span className="pm-menu-stack"><span>{l.label}</span></span></span>
            {on ? <i className="pm-menu-here">You’re here</i> : <ArrowUpRight size={18} className="pm-menu-arrow" />}
          </Link>;
        })}
      </nav>
      <div className="pm-menu-foot">
        {student ? (
          <div className="pm-menu-student">
            <div className="pm-menu-student-info">
              <span className="pm-user-av lg" aria-hidden="true">{student.initials}</span>
              <div className="pm-user-meta">
                <span className="pm-user-status"><i aria-hidden="true" /> Signed in</span>
                <strong>{student.name}</strong>
                <small>{student.email}</small>
              </div>
            </div>
            <div className="pm-menu-cta">
              <Link href="/dashboard" className="pm-btn" onClick={() => setOpen(false)}><LayoutDashboard size={15} /> Dashboard</Link>
              <button type="button" className="pm-btn ghost on-dark pm-menu-login" disabled={signingOut} onClick={handleSignOut}>
                <LogOut size={15} /> {signingOut ? 'Signing out…' : 'Sign Out'}
              </button>
            </div>
          </div>
        ) : (
          <div className="pm-menu-cta">
            <button type="button" className="pm-btn" aria-haspopup="dialog" onClick={() => openAuth('register')}>Register <ArrowUpRight size={14} /></button>
            <button type="button" className="pm-btn ghost on-dark pm-menu-login" aria-haspopup="dialog" onClick={() => openAuth('login')}><LogIn size={15} /> Login</button>
          </div>
        )}
        <div className="pm-menu-meta">
          <span>{site.whatsappDisplay}</span>
          <span>{site.location.split(',')[0]}, India</span>
        </div>
      </div>
    </div>}
  </>;
}
