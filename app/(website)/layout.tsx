import Link from '@/components/SiteLink';
import { ArrowUpRight, MapPin, MessageCircle, Phone, Mail } from 'lucide-react';
import Header from '@/components/Header';
import Motion from '@/components/Motion';
import { nav, site, whatsappLink } from '@/lib/site';
import { courses } from '@/lib/courses';
const hello = whatsappLink(`Hello ${site.name}, I’d like to know more.`);

export default function WebsiteLayout({children}:{children:React.ReactNode}) {
 return <>
<Motion />
      <div className="v-loader" aria-hidden="true">
        <div className="v-loader-inner">
          <img src="/brand/rakvih-mark-128.png" alt="" width={64} height={64} />
          <p>RAKVIH <span>Creative Academy</span></p>
          <span className="v-loader-bar"><i /></span>
        </div>
      </div>
        <Header />
        {children}
        <footer className="v-footer">
          <div className="v-footer-cta">
            <div>
              <p className="v-eyebrow light">Need a hand?</p>
              <h2>Not sure which course fits you? <em>Ask us.</em></h2>
              <p>Real people, real advice — talk to our team before you join.</p>
            </div>
            <div className="v-row">
              <a href={hello} target="_blank" rel="noopener noreferrer" className="v-pill-wa"><MessageCircle size={17} /> Chat on WhatsApp</a>
              <Link href="/contact" className="v-pill-ghost">Contact us <ArrowUpRight size={16} /></Link>
            </div>
          </div>
          <div className="v-footer-grid">
            <div className="v-footer-about">
              <Link href="/" className="v-footer-brand" aria-label="RAKVIH Creative Academy — home">
                <span className="v-footer-brand-icon" aria-hidden="true"><img src="/brand/rakvih-logo-square-on-dark.png" alt="" /></span>
                <span className="v-footer-brand-name">RAKVIH<small>Creative Academy</small></span>
              </Link>
              <p className="v-footer-blurb">{site.name} helps you turn creativity into a career — with practical training, a premium podcast studio and real production work.</p>
              <p className="v-footer-parent">{site.parent}</p>
              <Link href="/admissions" className="v-pill-white">Apply for admission <ArrowUpRight size={15} /></Link>
            </div>
            <nav aria-label="Footer"><p className="v-footer-label">Explore</p>{nav.map(l => <Link key={l.href} href={l.href}>{l.label}</Link>)}</nav>
            <nav aria-label="Courses"><p className="v-footer-label">Courses</p>{courses.slice(0, 6).map(c => <Link key={c.slug} href={`/courses#${c.slug}`}>{c.title}</Link>)}<Link href="/courses">All courses →</Link></nav>
            <div>
              <p className="v-footer-label">Get in touch</p>
              <a href={hello} target="_blank" rel="noopener noreferrer"><MessageCircle size={15} /> {site.whatsappDisplay}</a>
              <a href={`tel:+${site.whatsapp}`}><Phone size={15} /> Call us</a>
              {site.email && <a href={`mailto:${site.email}`}><Mail size={15} /> {site.email}</a>}
              <p><MapPin size={15} /> {site.location}</p>
            </div>
          </div>
          <div className="v-footer-bottom">
            <span>© {new Date().getFullYear()} RAKVIH Solutions Pvt. Ltd. All rights reserved.</span>
            <span className="v-footer-credit">Powered and designed by <a href="https://rakvih.in" target="_blank" rel="noopener noreferrer">RAKVIH</a></span>
            <span><Link href="/login">Student login</Link><Link href="/admin">Admin</Link></span>
          </div>
        </footer>
        <a className="wa-fab" href={hello} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">
          <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M16.04 3C8.86 3 3.03 8.82 3.03 16c0 2.29.6 4.53 1.74 6.5L3 29l6.68-1.75A12.93 12.93 0 0 0 16.04 29C23.2 29 29 23.18 29 16S23.2 3 16.04 3Zm0 23.64c-1.97 0-3.9-.53-5.58-1.53l-.4-.24-3.96 1.04 1.06-3.86-.26-.4a10.6 10.6 0 0 1-1.63-5.65c0-5.87 4.78-10.64 10.66-10.64 5.86 0 10.63 4.77 10.63 10.64 0 5.87-4.77 10.64-10.52 10.64Zm5.84-7.97c-.32-.16-1.89-.93-2.18-1.04-.3-.1-.5-.16-.72.16-.21.32-.82 1.04-1 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.18-.32-.02-.49.14-.65.15-.14.32-.37.48-.56.16-.19.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.3.32-1.12 1.09-1.12 2.66 0 1.57 1.14 3.09 1.3 3.3.16.21 2.25 3.43 5.45 4.81.76.33 1.36.53 1.82.67.77.24 1.46.21 2.01.13.61-.09 1.89-.77 2.15-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z" /></svg>
        </a>

</>;
}
