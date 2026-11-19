import Link from '@/components/SiteLink';
import Image from 'next/image';
import { ArrowUpRight, MessageCircle, Mic, Video, Lightbulb, Headphones, MonitorPlay, Camera, Scissors, Clapperboard, Aperture, Users } from 'lucide-react';
import HomeAdmissions from '@/components/v/HomeAdmissions';
import Words from '@/components/v/Words';
import HeroSlides from '@/components/v/HeroSlides';
import CoursePicker from '@/components/v/CoursePicker';
import WhyTabs from '@/components/v/WhyTabs';
import CareerCarousel from '@/components/v/CareerCarousel';
import { courses } from '@/lib/courses';
import { site, whatsappLink, studioAudience, studioFacilities, podcastServices, productionServices } from '@/lib/site';

const hello = whatsappLink(`Hello ${site.name}, I’d like to know more about your courses.`);
const studioColumns = [
  { title: 'Facilities', icon: Lightbulb, items: studioFacilities, dur: 34 },
  { title: 'Who books it', icon: Users, items: studioAudience, dur: 28 },
  { title: 'Services', icon: Mic, items: podcastServices, dur: 38 },
];
const journey = ['Learn the craft', 'Hands-on practice', 'Real projects', 'Your portfolio'];

export default function Home() {
  return <main className="v-home">
    {/* ── Hero ── */}
    <HeroSlides />

    {/* ── Toolkit ── */}
    <section className="v-dark v-toolkit">
      <div className="v-glow" aria-hidden="true" />
      <div className="v-center" data-v>
        <h2><Words text="A full toolkit for a" /><br /><Words text="full creative career." start={5} /></h2>
        <p className="v-sub">Training, studio access, real production work and portfolio support — everything you need to go from first class to finished work.</p>
      </div>
      <div className="v-wrap v-cards">
        <article className="v-card v-card-wide" data-v>
          <div className="v-card-copy">
            <strong className="v-big" data-count="4">4 steps</strong>
            <h3>From your first class to a finished portfolio.</h3>
            <p>Practical classes, guided practice and real projects — so you leave with work that shows what you can do.</p>
            <span className="v-chip"><img src="/brand/rakvih-mark-128.png" alt="" />RAKVIH method <small>Learn · Practise · Create</small></span>
          </div>
          <div className="v-chart" aria-hidden="true">
            <span className="v-chart-label">Your journey</span>
            <svg viewBox="0 0 520 260" preserveAspectRatio="none">
              <defs><linearGradient id="vArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a9ba5a" stopOpacity=".55" /><stop offset="1" stopColor="#a9ba5a" stopOpacity="0" /></linearGradient></defs>
              {[0, 1, 2, 3, 4].map(i => <line key={i} x1={i * 130} x2={i * 130} y1="0" y2="260" className="v-grid" />)}
              <path className="v-area" d="M0,236 C70,230 90,200 130,190 C190,176 220,150 260,132 C320,106 350,92 390,70 C440,44 480,30 520,18 L520,260 L0,260Z" fill="url(#vArea)" />
              <path className="v-line" pathLength="1" d="M0,236 C70,230 90,200 130,190 C190,176 220,150 260,132 C320,106 350,92 390,70 C440,44 480,30 520,18" />
              {[[130, 190], [260, 132], [390, 70], [512, 21]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" className="v-pt" style={{ '--i': i } as React.CSSProperties} />)}
            </svg>
            {journey.map((j, i) => <span key={j} className="v-chart-pill" style={{ '--i': i, left: `${[25, 50, 75, 97][i]}%`, top: `${[73, 51, 27, 8][i]}%` } as React.CSSProperties}>{j}</span>)}
          </div>
        </article>
        <article className="v-card" data-v>
          <span className="v-card-label">Courses</span>
          <strong className="v-big" data-count="8">8 courses</strong>
          <div className="v-dial" aria-hidden="true"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" className="v-dial-ring" /><path d="M60,60 L60,8 A52,52 0 0 1 112,60 Z" className="v-dial-fill" />{Array.from({ length: 8 }, (_, i) => <line key={i} x1="60" y1="4" x2="60" y2="12" transform={`rotate(${i * 45} 60 60)`} />)}</svg></div>
          <ul className="v-mini-pills">{['Editing', 'Camera', 'Photo', 'Film'].map(t => <li key={t}>{t}</li>)}</ul>
          <h3>Professional courses</h3>
          <p>From editing and cinematography to motion graphics, sound and AI tools.</p>
        </article>
        <article className="v-card" data-v>
          <span className="v-card-label">Studio</span>
          <strong className="v-big">On air</strong>
          <div className="v-wave" aria-hidden="true">{Array.from({ length: 28 }, (_, i) => <i key={i} style={{ '--i': i, '--h': `${20 + Math.round(Math.abs(Math.sin(i * 0.9)) * 70)}%` } as React.CSSProperties} />)}</div>
          <h3>Premium podcast studio</h3>
          <p>Professional microphones, multi-camera recording and acoustic treatment.</p>
        </article>
      </div>
    </section>

    {/* ── Studio ── */}
    <section className="v-cream v-studio">
      <div className="v-sunrise" aria-hidden="true" />
      <div className="v-center" data-v>
        <h2><Words text="A studio built for the" /><br /><Words text="way you create." start={5} /></h2>
        <p className="v-sub">Record podcasts, interviews and video series in a professionally equipped space — with production and editing support when you need it.</p>
      </div>
      <div className="v-wrap">
        <div className="v-studio-card" data-v data-cursor="Book">
          <Image src="/images/academy-studio.webp" alt="Illustration of a podcast studio with microphones and armchairs" fill sizes="(max-width: 900px) 100vw, 1200px" />
          <div className="v-studio-copy">
            <div>
              <p className="v-eyebrow light"><span className="v-live-dot" /> RAKVIH Podcast Studio</p>
              <h3>Book the studio for your next show.</h3>
              <ul className="v-glass-pills"><li>Multi-camera</li><li>Acoustic treatment</li><li>Editing support</li></ul>
            </div>
            <div className="v-studio-book">
              <p>Tell us your date and format — audio or video — and we’ll confirm your slot on WhatsApp.</p>
              <div className="v-row">
                <Link href="/podcast-studio#book" className="v-pill-white">Book a slot <ArrowUpRight size={15} /></Link>
                <a href={whatsappLink(`Hello ${site.name}, I’d like to book the podcast studio.`)} target="_blank" rel="noopener noreferrer" className="v-pill-ghost"><MessageCircle size={15} /> Ask on WhatsApp</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── Studio offers (moving columns) ── */}
    <section className="v-offers">
      <div className="v-wrap v-offers-grid">
        <div className="v-offers-copy" data-v>
          <p className="v-eyebrow light">Inside the studio</p>
          <h2><Words text="Everything the" /><br /><Words text="studio offers." start={2} /></h2>
          <p className="v-sub">Professional facilities, the people who book it and the services we provide — from a single recording to a complete podcast production package.</p>
          <Link href="/podcast-studio" className="v-pill-white">Explore the studio <ArrowUpRight size={15} /></Link>
        </div>
        <div className="v-tickers">
          {studioColumns.map((col, c) => <div key={col.title} className={'v-ticker' + (c === 1 ? ' down' : '')} style={{ '--dur': `${col.dur}s` } as React.CSSProperties}>
            <p className="v-ticker-title"><col.icon size={15} />{col.title}<span>{col.items.length}</span></p>
            <div className="v-ticker-win">
              <ul>{[...col.items, ...col.items].map((it, i) => <li key={i} aria-hidden={i >= col.items.length}><span><col.icon size={13} /></span>{it}</li>)}</ul>
            </div>
          </div>)}
        </div>
      </div>
    </section>

    {/* ── Courses ── */}
    <section className="v-cream v-courses"><div className="v-wrap"><CoursePicker /></div></section>

    {/* ── Production ── */}
    <section className="v-production">
      <Image src="/images/course-cinematography.webp" alt="" fill sizes="100vw" className="v-production-bg" />
      <div className="v-wrap">
        <div className="v-glass-panel" data-v>
          <div>
            <p className="v-eyebrow light"><Aperture size={14} /> RAKVIH Production</p>
            <h2>From concept to the final cut.</h2>
            <div className="v-stat-box"><span className="v-stat-tag">Production services</span><strong data-count="12">12</strong><small>Brand films · Events · Podcasts · Reels</small></div>
            <p className="v-small">Our creative team produces videos, photography and podcasts for brands, businesses and creators.</p>
            <Link href="/production" className="v-pill-white">See all services <ArrowUpRight size={15} /></Link>
          </div>
          <ul className="v-prod-list">{productionServices.slice(0, 6).map((s, i) => <li key={s.title} style={{ '--i': i } as React.CSSProperties}><span>{String(i + 1).padStart(2, '0')}</span>{s.title}</li>)}</ul>
        </div>
      </div>
    </section>

    {/* ── Why ── */}
    <section className="v-cream v-whysec">
      <div className="v-wrap">
        <div className="v-center left" data-v><p className="v-eyebrow">Why RAKVIH Creative Academy</p><h2>Everything you need to <em>grow</em> as a creator.</h2></div>
        <WhyTabs />
      </div>
    </section>

    {/* ── Careers ── */}
    <section className="v-sage v-careersec">
      <div className="v-center" data-v>
        <h2><Words text="Your skills." /><br /><Words text="Your career path." start={2} /></h2>
        <p className="v-sub">Twelve creative careers our training prepares you for — here are six of them.</p>
      </div>
      <div className="v-wrap"><CareerCarousel /><p className="v-fine">Career guidance and placement assistance are subject to available opportunities. Employment is not guaranteed.</p></div>
    </section>

    {/* ── WhatsApp: real advice + enquiry ── */}
    <section className="v-sage v-phone-sec v-wa">
      <div className="v-wrap">
        <header className="v-wa-head" data-v>
          <div>
            <p className="v-eyebrow">Real people. Real advice.</p>
            <h2><Words text="Your enquiry, straight" /><br /><Words text="to WhatsApp." start={3} /></h2>
          </div>
          <div className="v-wa-head-side">
            <p className="v-sub">Courses, batches, studio bookings or a production brief — pick what you need, add your details and your message opens in WhatsApp, ready to send. Our team replies right there.</p>
            <div className="v-row">
              <a href="#enquire" className="v-pill-dark">Start your enquiry <ArrowUpRight size={15} /></a>
              <a href={hello} target="_blank" rel="noopener noreferrer" className="v-pill-wa"><MessageCircle size={16} /> Chat on WhatsApp</a>
            </div>
          </div>
        </header>
        <div className="v-wa-grid">
          <div className="v-bubbles" data-v>
            <div className="v-bubble me" style={{ '--d': 0 } as React.CSSProperties}><p>Hi RAKVIH 👋 I love editing reels. Which course should I start with?</p><span className="v-who"><i>Y</i>You</span></div>
            <div className="v-bubble them" style={{ '--d': 1 } as React.CSSProperties}><p>Professional Video Editing is a great start — Premiere Pro, DaVinci Resolve, colour grading and reels editing.</p><span className="v-who"><img src="/brand/rakvih-mark-128.png" alt="" />RAKVIH Creative Academy</span></div>
            <div className="v-bubble me alt" style={{ '--d': 2 } as React.CSSProperties}><p>Perfect. Can you share the fees and the next batch?</p><span className="v-who"><i>Y</i>You</span></div>
            <p className="v-bubble-note">Example conversation</p>
          </div>
          <div className="v-wa-phone-col">
            <p className="v-wa-phone-label"><span>1</span> Fill the form <i /> <span>2</span> WhatsApp opens <i /> <span>3</span> Tap send</p>
            <div className="v-phone" data-v aria-hidden="true">
              <div className="v-phone-screen">
                <div className="v-phone-status"><b>9:41</b><span /></div>
                <div className="v-phone-head"><img src="/brand/rakvih-mark-128.png" alt="" /><span>RAKVIH Creative Academy<small>WhatsApp</small></span></div>
                <h4>Turn your creativity into your career.</h4>
                <div className="v-phone-msg">
                  <b>New course enquiry</b>
                  <p><i>Name:</i> Your name</p><p><i>Course:</i> Cinematography</p><p><i>Email:</i> you@example.com</p><p><i>Mode:</i> Weekend batch</p>
                  <span className="v-phone-send">Send ➤</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── Enquiry ── */}
    <HomeAdmissions />
  </main>;
}
