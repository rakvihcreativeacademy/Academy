import DigitalWordmark from './DigitalWordmark';
import { ArrowUpRight, Facebook, Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone, Youtube } from 'lucide-react';
import Link from '@/components/SiteLink';
import { nav, site, whatsappLink } from '@/lib/site';
import { courses } from '@/lib/courses';
import styles from './SiteFooter.module.css';

const socialIcons: Record<string, React.ReactNode> = {
  Instagram: <Instagram size={17} />,
  Facebook: <Facebook size={17} />,
  YouTube: <Youtube size={17} />,
  LinkedIn: <Linkedin size={17} />,
};

/** Site-wide black footer. */
export default function SiteFooter() {
  const hello = whatsappLink(`Hello ${site.name}, I'd like to know more.`);
  const year = new Date().getFullYear();

  return (
    <footer className={styles.foot} data-media>
      <div className={styles.wrap}>
        {/* help prompt */}
        <div className={styles.cta}>
          <div>
            <p className={styles.kicker}><span /> Need a hand?</p>
            <h2>Not sure which course fits you? <em>Ask us.</em></h2>
          </div>
          <div className={styles.ctaBtns}>
            <a className={styles.btnWa} href={hello} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> Chat on WhatsApp</a>
            <Link className={styles.btnSun} href="/contact">Contact us <ArrowUpRight size={18} /></Link>
          </div>
        </div>

        {/* columns */}
        <div className={styles.grid}>
          <div className={styles.about}>
            <Link href="/" className={styles.brand} aria-label={`${site.name} — home`}>
              <span className={styles.originalLogo}>
                <img src="/brand/rakvih-logo.png" alt="RAKVIH Solutions Private Limited" width={1052} height={373} loading="lazy" />
              </span>
              <span className={styles.digitalLogo}>
                <DigitalWordmark lazy />
              </span>
            </Link>
            <p>{site.promise} Creative education, a premium podcast studio, production services and technology solutions under one brand.</p>
            <p className={styles.parent}>{site.parent}</p>
            <div className={styles.social}>
              {site.social.filter(s => s.href).map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>{socialIcons[s.label]}</a>
              ))}
            </div>
          </div>

          <nav aria-label="Footer" className={styles.col}>
            <h3>Explore</h3>
            {nav.map(l => <Link key={l.href} href={l.href}>{l.label}</Link>)}
          </nav>

          <nav aria-label="Courses" className={styles.col}>
            <h3>Courses</h3>
            {courses.map(c => <Link key={c.slug} href={`/courses#${c.slug}`}>{c.title}</Link>)}
            <Link href="/courses" className={styles.all}>All {courses.length} courses <ArrowUpRight size={14} /></Link>
          </nav>

          <div className={styles.col}>
            <h3>Get in touch</h3>
            <a href={hello} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> {site.whatsappDisplay}</a>
            <a href={`tel:+${site.whatsapp}`}><Phone size={16} /> Call us</a>
            {site.email && <a href={`mailto:${site.email}`}><Mail size={16} /> {site.email}</a>}
            <p><MapPin size={16} /> {site.location}</p>
            <Link href="/admissions" className={styles.apply}>Apply for admission <ArrowUpRight size={16} /></Link>
          </div>
        </div>

        {/* bottom bar */}
        <div className={styles.bottom}>
          <span>© {year} RAKVIH Solutions Pvt. Ltd. All rights reserved.</span>
          <span className={styles.legal}><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms &amp; Conditions</Link></span>
          <span>Designed and powered by <a href="https://www.rakvih.in" target="_blank" rel="noopener noreferrer">RAKVIH</a></span>
        </div>
      </div>
    </footer>
  );
}
