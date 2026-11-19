'use client';

import Link from '@/components/SiteLink';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowRight, MessageCircle, Menu, X, Home, Info, GraduationCap, Mic, Clapperboard, Images, Briefcase, MapPin, LogIn } from 'lucide-react';
import { nav, site, whatsappLink } from '@/lib/site';

const menuIcons = [Home, Info, GraduationCap, Mic, Clapperboard, Images, Briefcase, MapPin];

export default function Header() {
  const [pathname, setPathname] = useState('');
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);

  useEffect(() => {
    const syncPathname = () => setPathname(window.location.pathname);
    syncPathname();
    window.addEventListener('popstate', syncPathname);
    return () => window.removeEventListener('popstate', syncPathname);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => panel.current?.querySelector<HTMLButtonElement>('button')?.focus());
    const dismiss = () => { setOpen(false); toggle.current?.focus(); };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); dismiss(); }
      if (event.key !== 'Tab') return;
      const items = panel.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (!items?.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    const onResize = () => { if (window.innerWidth > 1240) dismiss(); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frame);
      document.documentElement.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href + '/'));
  const close = () => { setOpen(false); toggle.current?.focus(); };

  return <>
    <header className="v-header">
      <Link href="/" className="v-brand" aria-label={`${site.name} — home`}><img src="/brand/rakvih-logo-wide-360.png" alt="RAKVIH" width={180} height={61} /><span>Creative<br />Academy</span></Link>
      <nav className="v-nav" aria-label="Main">{nav.map(l => <Link key={l.href} href={l.href} className={isActive(l.href) ? 'active' : ''} aria-current={isActive(l.href) ? 'page' : undefined}>{l.label}</Link>)}</nav>
      <div className="v-header-actions"><Link className="v-login" href="/login">Login</Link><Link className="v-apply" href="/admissions">Apply <ArrowUpRight size={14} /></Link><button ref={toggle} type="button" disabled={!pathname} aria-busy={!pathname} className="v-burger" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="academy-mobile-menu" onClick={() => open ? close() : setOpen(true)}>{open ? <X size={18} /> : <Menu size={18} />}</button></div>
    </header>
    {open && <div className="mobile-navigation-layer"><button type="button" className="mobile-navigation-backdrop" aria-label="Dismiss navigation" tabIndex={-1} onClick={close} /><section ref={panel} id="academy-mobile-menu" className="mobile-navigation-panel" role="dialog" aria-modal="true" aria-labelledby="mobile-navigation-title"><div className="mobile-navigation-heading"><div><p>YOUR NEXT CHAPTER</p><h2 id="mobile-navigation-title">Explore RAKVIH<span>.</span></h2></div><button type="button" className="mobile-navigation-close" aria-label="Close navigation" onClick={close}><X size={19} /></button></div><nav className="mobile-navigation-grid" aria-label="Mobile">{nav.map((l, i) => { const Icon = menuIcons[i]; return <Link key={l.href} href={l.href} className={isActive(l.href) ? 'active' : ''} aria-current={isActive(l.href) ? 'page' : undefined} onClick={() => setOpen(false)}><span className="mobile-navigation-icon"><Icon size={18} strokeWidth={1.6} /></span><span>{l.label}</span><ArrowUpRight size={13} /></Link>; })}</nav><Link className="mobile-navigation-login" href="/login" onClick={() => setOpen(false)}><LogIn size={18} /><span>Student & admin login</span><ArrowRight size={17} /></Link><a className="mobile-navigation-chat" href={whatsappLink(`Hello ${site.name}, I’d like to know more.`)} target="_blank" rel="noopener noreferrer" onClick={close}><MessageCircle size={18} /><span>Have a question? Talk to us</span><ArrowUpRight size={15} /></a><p className="mobile-navigation-location"><MapPin size={12} /> Bengaluru · Creative learning starts here</p></section></div>}
  </>;
}
