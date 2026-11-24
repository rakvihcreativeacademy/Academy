import Link from '@/components/SiteLink';
import { ArrowUpRight, MapPin, MessageCircle, Phone, Mail, Instagram, Facebook, Youtube, Linkedin } from 'lucide-react';
import Masthead from '@/components/p/Masthead';
import Motion from '@/components/p/Motion';
import SmoothScroll from '@/components/p/SmoothScroll';
import { nav, site, whatsappLink } from '@/lib/site';
import { courses } from '@/lib/courses';

const hello = whatsappLink(`Hello ${site.name}, I'd like to know more.`);

const socialIcons: Record<string, React.ReactNode> = {
  Instagram: <Instagram size={15} />,
  Facebook: <Facebook size={15} />,
  YouTube: <Youtube size={15} />,
  LinkedIn: <Linkedin size={15} />,
};

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return <div className="pm-site">
    <Motion />
    <SmoothScroll />
    <Masthead />
    {children}
    <footer className="pm-foot" data-dark>
      <div className="pm-wrap">
        <div className="pm-foot-cta">
          <div data-v>
            <p className="pm-label on-dark rule" style={{ marginBottom: 26 }}>Need a hand?</p>
            <h2 className="pm-h2 on-dark">Not sure which course fits you? <em>Ask us.</em></h2>
          </div>
          <div className="pm-row on-dark">
            <a href={hello} target="_blank" rel="noopener noreferrer" className="pm-btn wa"><MessageCircle size={15} /> Chat on WhatsApp</a>
            <Link href="/contact" className="pm-btn">Contact us <ArrowUpRight size={15} /></Link>
          </div>
        </div>
        <div className="pm-foot-grid">
          <div className="pm-foot-about">
            <Link href="/" className="pm-brand" aria-label={`${site.name} — home`}><span className="pm-lockup"><span className="pm-lockup-row"><img className="pm-mark" src="/brand/rakvih-mark.png" alt="" width={331} height={373} /><span className="pm-wordmark-txt"><b>RAKVIH</b><small>Solutions Private Limited</small></span></span><span className="pm-lockup-name">Rakvih <i>Digital</i></span></span></Link>
            <p>{site.promise} {site.name} brings creative education, a premium podcast studio, production services and technology solutions together under one brand.</p>
            <p style={{ fontSize: 12 }}>{site.parent}</p>
            <div className="pm-foot-social">{site.social.filter(s => s.href).map(s => <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">{socialIcons[s.label]} {s.label}</a>)}</div>
          </div>
          <nav aria-label="Footer" className="pm-foot-explore"><h4>Explore</h4>{nav.map(l => <Link key={l.href} href={l.href}>{l.label}</Link>)}</nav>
          <nav aria-label="Courses" className="pm-foot-courses"><h4>Courses</h4>{courses.map(c => <Link key={c.slug} href={`/courses#${c.slug}`}>{c.title}</Link>)}<Link href="/courses" className="pm-foot-all">All 8 courses <ArrowUpRight size={13} /></Link></nav>
          <div className="pm-foot-contact">
            <h4>Get in touch</h4>
            <a href={hello} target="_blank" rel="noopener noreferrer"><MessageCircle size={15} /> {site.whatsappDisplay}</a>
            <a href={`tel:+${site.whatsapp}`}><Phone size={15} /> Call us</a>
            {site.email && <a href={`mailto:${site.email}`}><Mail size={15} /> {site.email}</a>}
            <p><MapPin size={15} /> {site.location}</p>
            <Link href="/admissions" className="pm-link" style={{ marginTop: 14, color: 'var(--pm-sun)' }}>Apply for admission <ArrowUpRight size={14} /></Link>
          </div>
        </div>
      </div>
      <div className="pm-wrap pm-foot-bottom">
        <span>© {new Date().getFullYear()} RAKVIH Solutions Pvt. Ltd. All rights reserved.</span>
        <span className="pm-legal"><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms &amp; Conditions</Link></span>
        <span className="pm-credit">Designed and powered by <a href="https://www.rakvih.in" target="_blank" rel="noopener noreferrer">RAKVIH</a></span>
      </div>
    </footer>
    <a className="wa-fab" href={hello} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">
      <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M16.04 3C8.86 3 3.03 8.82 3.03 16c0 2.29.6 4.53 1.74 6.5L3 29l6.68-1.75A12.93 12.93 0 0 0 16.04 29C23.2 29 29 23.18 29 16S23.2 3 16.04 3Zm0 23.64c-1.97 0-3.9-.53-5.58-1.530l-.4-.24-3.96 1.04 1.06-3.86-.26-.4a10.6 10.6 0 0 1-1.63-5.65c0-5.870 4.78-10.64 10.66-10.64 5.86 0 10.63 4.77 10.63 10.64 0 5.87-4.77 10.64-10.52 10.640Zm5.84-7.97c-.32-.16-1.89-.93-2.18-1.04-.3-.1-.5-.16-.72.16-.21.32-.82 1.04-1 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.18-.32-.02-.49.14-.65.15-.14.32-.37.48-.56.16-.19.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.3.32-1.12 1.09-1.12 2.66 0 1.57 1.14 3.09 1.3 3.3.16.21 2.25 3.43 5.45 4.81.76.33 1.36.53 1.82.67.77.24 1.46.21 2.01.13.61-.09 1.89-.77 2.15-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z" /></svg>
    </a>
  </div>;
}
