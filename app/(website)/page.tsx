import Link from '@/components/SiteLink';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import Hero from '@/components/p/Hero';
import CourseIndex from '@/components/p/CourseIndex';
import Covers from '@/components/p/Covers';
import Words from '@/components/v/Words';
import FormSection from '@/components/v/FormSection';
import Band from '@/components/p/Band';
import Pillars from '@/components/p/Pillars';
import Offers from '@/components/p/Offers';
import { courses } from '@/lib/courses';
import { site, whatsappLink, studioFacilities, studioAudience, productionServices } from '@/lib/site';

const steps = [
  { t: 'Learn the craft', d: 'Practical classes with experienced trainers — the fundamentals of light, frame, sound and story.' },
  { t: 'Hands-on practice', d: 'Professional cameras, lighting and industry software, with individual attention as you go.' },
  { t: 'Real projects', d: 'Short films, promotional videos, photography assignments, interviews and digital content.' },
  { t: 'Your portfolio', d: 'Leave with finished work that shows what you can do — plus guidance on freelancing and careers.' },
];
const sheet = [
  { src: '/images/academy-filmmaking.webp', n: '12A' }, { src: '/images/academy-photography.webp', n: '13' },
  { src: '/images/course-lighting-sound.webp', n: '13A' }, { src: '/images/academy-editing.webp', n: '14' },
  { src: '/images/course-motion-graphics.webp', n: '14A' }, { src: '/images/course-cinematography.webp', n: '15' },
  { src: '/images/course-content-creation.webp', n: '15A' }, { src: '/images/course-ai-creative.webp', n: '16' },
];

export default function Home() {
  return <main className="pm-home">
    <Hero />

    <Band words={['Video editing', 'Cinematography', 'Photography', 'Filmmaking', 'Motion design', 'Sound', 'Content']} />

    {/* (01) — Manifesto */}
    <section className="pm-sec pm-paper">
      <div className="pm-wrap">
        <div className="pm-manifesto-grid">
          <div className="pm-manifesto-side">
            <p className="pm-label rule">(01) — <b>Welcome</b></p>
            <p className="pm-small" style={{ maxWidth: 280, margin: 0 }}><strong style={{ color: 'var(--pm-text)' }}>{site.name}</strong><br />{site.parent}</p>
            <p className="pm-small" style={{ maxWidth: 280, margin: 0, fontStyle: 'normal' }}>{site.promise}</p>
          </div>
          <p className="pm-manifesto-text" data-v>
            We teach the craft of <em>seeing</em> <span className="pm-inline-img"><img src="/images/academy-photography.webp" alt="" loading="lazy" /></span> — light, frame and the decisive moment. The discipline of the <em>cut</em> <span className="pm-inline-img"><img src="/images/academy-editing.webp" alt="" loading="lazy" /></span>, the patience of sound, <span className="mute">and the courage to make work that is</span> unmistakably <em>yours</em> <span className="pm-inline-img"><img src="/images/academy-filmmaking.webp" alt="" loading="lazy" /></span>.
          </p>
        </div>
        <div className="pm-welcome" data-v>
          <div>
            <p>Welcome to {site.name} — a creative and technology-driven destination for aspiring video editors, cinematographers, photographers, filmmakers and digital content creators.</p>
            <p>We combine creative education with practical industry experience to help individuals transform their passion into professional skills. From mastering professional editing software to operating cinema cameras, creating films, producing podcasts and developing digital content, we provide hands-on learning experiences that prepare students for the creative industry.</p>
          </div>
          <div className="pm-welcome-cta">
            <strong>Learn the Skills. Master the Technology. <em>Create Your Future.</em></strong>
            <div className="pm-row">
              <Link href="/courses" className="pm-btn ink">Explore Our Courses <ArrowUpRight size={15} /></Link>
              <Link href="/podcast-studio#enquire" className="pm-btn ghost">Book Our Podcast Studio</Link>
              <Link href="/admissions" className="pm-btn ghost">Enquire for Admission</Link>
            </div>
            <Link href="/production#enquire" className="pm-link" style={{ alignSelf: 'flex-start' }}>Enquire About Production Services <ArrowUpRight size={14} /></Link>
          </div>
        </div>
        <div className="pm-stats">
          <div data-v><strong className="pm-num">{String(courses.length).padStart(2, '0')}</strong><span>Professional courses</span></div>
          <div data-v><strong className="pm-num">01</strong><span>Premium podcast studio</span></div>
          <div data-v><strong className="pm-num">{productionServices.length}</strong><span>Production services</span></div>
          <div data-v><strong className="pm-num">04</strong><span>Steps to a finished portfolio</span></div>
        </div>
      </div>
    </section>

    {/* (02) — What we offer */}
    <section className="pm-sec pm-paper2">
      <div className="pm-wrap">
        <div className="pm-head-row">
          <div data-v>
            <p className="pm-label rule">(02) — <b>What we offer</b></p>
            <h2 className="pm-h2"><Words text="One brand." /> <em><Words text="Every creative service." start={2} /></em></h2>
          </div>
          <p className="pm-lede">{site.positioning}</p>
        </div>
        <Offers />
      </div>
    </section>

    {/* (03) — Programmes */}
    <section className="pm-sec pm-dark" data-dark>
      <div className="pm-wrap">
        <div className="pm-head-row">
          <div data-v>
            <p className="pm-label rule">(03) — <b>The Programmes</b></p>
            <h2 className="pm-h2"><Words text="Eight disciplines." /> <em><Words text="One creative career." start={2} /></em></h2>
          </div>
          <div className="pm-stack" style={{ gap: 24 }}>
            <p className="pm-lede">From editing and cinematography to motion graphics, sound and AI tools. Choose a discipline — or combine them.</p>
            <Link href="/courses" className="pm-link" style={{ alignSelf: 'flex-start' }}>View all courses <ArrowUpRight size={14} /></Link>
          </div>
        </div>
        <CourseIndex />
      </div>
    </section>

    {/* (04) — Method */}
    <section className="pm-sec pm-paper2" style={{ overflow: 'hidden' }}>
      <div className="pm-wrap">
        <div className="pm-head-row">
          <div data-v>
            <p className="pm-label rule">(04) — <b>The Method</b></p>
            <h2 className="pm-h2"><Words text="From your first class" /> <em><Words text="to a finished portfolio." start={4} /></em></h2>
          </div>
          <p className="pm-lede">Learn · Practise · Create. Every programme follows the same four movements, so you leave with work — not just notes.</p>
        </div>
        <div className="pm-steps">
          {steps.map((s, i) => <article key={s.t} data-v style={{ '--d': `${i * 90}ms` } as React.CSSProperties}>
            <span className="n pm-num">{String(i + 1).padStart(2, '0')}</span><h3>{s.t}</h3><p>{s.d}</p>
          </article>)}
        </div>
      </div>
      <div className="pm-sheet" aria-hidden="true" data-no-reveal>
        <div className="pm-sheet-track">
          {[...sheet, ...sheet].map((f, i) => <figure key={i} className={'pm-frame' + (i % 8 === 3 ? ' pick' : '')} style={{ margin: 0 }}><img src={f.src} alt="" loading="lazy" /><small>▸ {f.n} &nbsp; RAKVIH 400</small></figure>)}
        </div>
      </div>
    </section>

    {/* (05) — Studio */}
    <section className="pm-sec pm-dark2" data-dark>
      <div className="pm-wrap pm-studio-grid">
        <figure className="pm-plate" data-v>
          <div className="pm-plate-img" data-cursor="Book">
            <img src="/images/academy-studio.webp" alt="Illustration of the RAKVIH podcast studio with microphones and armchairs" loading="lazy" data-parallax="0.06" />
            <span className="pm-onair"><i />ON AIR</span>
            <span className="pm-wave" aria-hidden="true">{Array.from({ length: 22 }, (_, k) => <i key={k} style={{ '--i': k, '--h': 25 + Math.round(Math.abs(Math.sin(k * 1.3)) * 75) } as React.CSSProperties} />)}</span>
          </div>
          <figcaption><span>Plate 04 — RAKVIH Podcast Studio</span><span>Bengaluru</span></figcaption>
        </figure>
        <div className="pm-stack">
          <div data-v>
            <p className="pm-label rule" style={{ marginBottom: 28 }}>(05) — <b>The Studio</b></p>
            <h2 className="pm-h2"><Words text="A studio built for" /> <em><Words text="the way you create." start={4} /></em></h2>
          </div>
          <p className="pm-lede">Record podcasts, interviews and video series in a professionally equipped space — with production and editing support when you need it.</p>
          <ul className="pm-list">{studioFacilities.slice(0, 8).map((f, i) => <li key={f}><span className="pm-num">{String(i + 1).padStart(2, '0')}</span>{f}</li>)}</ul>
          <div>
            <p className="pm-label" style={{ marginBottom: 14 }}>Who books it</p>
            <ul className="pm-tags">{studioAudience.slice(0, 6).map(a => <li key={a}>{a}</li>)}</ul>
          </div>
          <div className="pm-row on-dark">
            <Link href="/podcast-studio#enquire" className="pm-btn">Book a slot <ArrowUpRight size={15} /></Link>
            <a href={whatsappLink(`Hello ${site.name}, I’d like to book the podcast studio.`)} target="_blank" rel="noopener noreferrer" className="pm-btn ghost on-dark"><MessageCircle size={15} /> Ask on WhatsApp</a>
          </div>
        </div>
      </div>
    </section>

    {/* (06) — Production (letterboxed) */}
    <section className="pm-prod" data-v data-dark>
      <img src="/images/course-cinematography.webp" alt="" loading="lazy" data-parallax="0.08" />
      <span className="bar t" aria-hidden="true" /><span className="bar b" aria-hidden="true" />
      <div className="pm-prod-inner">
        <p className="pm-label on-dark">(06) — <b>RAKVIH Digital Production</b></p>
        <h2 className="pm-h2">From concept <em>to the final cut.</em></h2>
        <p className="pm-lede" style={{ color: '#cfccbd', textAlign: 'center' }}>Our creative team produces videos, photography and podcasts for brands, businesses and creators.</p>
        <div className="pm-prod-marquee" aria-label="Production services">
          <div>{[...productionServices, ...productionServices].map((s, k) => <span key={k} aria-hidden={k >= productionServices.length}>{s.title}</span>)}</div>
        </div>
        <div className="on-dark"><Link href="/production" className="pm-btn ghost on-dark">See all services <ArrowUpRight size={15} /></Link></div>
      </div>
      <div className="frame-info" aria-hidden="true"><span>2.39 : 1 — Anamorphic</span><span>Scene 05 · Take 01</span></div>
    </section>

    {/* (07) — Standard */}
    <section className="pm-sec pm-paper">
      <div className="pm-wrap">
        <div className="pm-head-row">
          <div data-v>
            <p className="pm-label rule">(07) — <b>Why choose RAKVIH Digital?</b></p>
            <h2 className="pm-h2"><Words text="Everything you need" /> <em><Words text="to grow as a creator." start={3} /></em></h2>
          </div>
          <p className="pm-lede">Practical learning, professional tools, a real studio and a portfolio at the end of it.</p>
        </div>
        <Pillars />
      </div>
    </section>

    {/* (08) — Careers */}
    <section className="pm-sec pm-paper2" style={{ overflow: 'hidden' }}>
      <div className="pm-wrap">
        <div className="pm-head-row">
          <div data-v>
            <p className="pm-label rule">(08) — <b>Careers</b></p>
            <h2 className="pm-h2"><Words text="Your skills." /> <em><Words text="Your career path." start={2} /></em></h2>
          </div>
          <div className="pm-stack" style={{ gap: 24 }}>
            <p className="pm-lede">Twelve creative careers our training prepares you for — here are six of them.</p>
            <Link href="/careers" className="pm-link" style={{ alignSelf: 'flex-start' }}>Explore career paths <ArrowUpRight size={14} /></Link>
          </div>
        </div>
        <Covers note="Career guidance and placement assistance are subject to available opportunities. Employment is not guaranteed." />
      </div>
    </section>

    {/* Enquiry */}
    <FormSection eyebrow="Admissions & enquiries" title="Learn the art. Master the technology." italic="Create your future."
      sub="One small step towards something creative. Tell us what interests you — a course, a studio booking or a production brief — and we’ll help you find the right direction."
      allowTypeSwitch note="Creative learning images are AI-generated illustrations, not photographs of RAKVIH facilities." />
  </main>;
}
