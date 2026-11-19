import type { Metadata } from 'next';
import { ArrowUpRight, MessageCircle, MapPin, Check } from 'lucide-react';
import Link from '@/components/SiteLink';
import { getPageContent } from '@/lib/cms/server';
import EnquiryForm from '@/components/EnquiryForm';
import { courses } from '@/lib/courses';
import { courseImages } from '@/lib/course-images';
import { site, whatsappLink } from '@/lib/site';

export const metadata: Metadata = { title: 'Admissions' };
const stages = [
  { t: 'Tell us what excites you', d: 'Choose a course and share a little about your goals.' },
  { t: 'Let’s talk possibilities', d: 'Our team shares course details, fees and batch availability.' },
  { t: 'Start making things', d: 'Find your direction and take the next step with RAKVIH.' },
];

// Cached; ?course= and ?type= are applied in the browser by the form.
export const revalidate = 300;
export default async function Admissions() {
  const catalogue = await getPageContent('courses');
  const courseOptions = catalogue.sections.flatMap(s => s.items.map(i => i.title));
  return <main className="ap-page">
    <section className="ap-hero" data-hero data-dark id="apply">
      <img className="ap-bg" src="/images/course-content-creation.webp" alt="" aria-hidden="true" />
      <div className="pm-wrap ap-grid">
        <div className="ap-copy">
          <p className="pm-label on-dark"><span className="pm-dot" /> Admissions open — {site.location.split(',')[0]}</p>
          <h1>Your creative journey <em>starts here.</em></h1>
          <p className="ap-lede">Whether you are a beginner, student, working professional or aspiring content creator, we have learning opportunities to help you develop your skills. No matter where your creative journey begins, we help you take the next step.</p>
        </div>
        <div className="ap-more">
          <ol className="ap-steps">{stages.map((s, i) => <li key={s.t}><span>{String(i + 1).padStart(2, '0')}</span><div><b>{s.t}</b><small>{s.d}</small></div></li>)}</ol>
          <ul className="ap-perks">{['Beginners welcome', 'Project-based learning', 'Completion certificate'].map(x => <li key={x}><Check size={14} />{x}</li>)}</ul>
          <div className="ap-contact">
            <a href={whatsappLink(`Hello ${site.name}, I’d like to know more about admissions.`)} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> {site.whatsappDisplay}</a>
            <span><MapPin size={16} /> {site.location}</span>
          </div>
        </div>
        <div className="pm-form-card ap-card">
          <header>
            <div><p className="pm-label"><span className="pm-dot" /> Opens in WhatsApp</p><h3>Apply for Admission Today.</h3></div>
            <img src="/brand/rakvih-mark-128.png" alt="" />
          </header>
          <EnquiryForm courseOptions={courseOptions} allowTypeSwitch fromUrl />
          <p className="pm-fine">Submitting opens WhatsApp with your enquiry ready to send.</p>
        </div>
      </div>
    </section>

    <section className="pm-sec pm-paper">
      <div className="pm-wrap">
        <div className="pm-head-row">
          <div><p className="pm-label rule" style={{ marginBottom: 18 }}>Choose your programme</p><h2 className="pm-h2">Not sure yet? <em>Start with a course.</em></h2></div>
          <p className="pm-lede">Pick a programme and it’s pre-selected in the form above.</p>
        </div>
        <div className="ap-courses">
          {courses.map(c => <Link key={c.slug} className="ap-course" data-v href={`/admissions?course=${encodeURIComponent(c.title)}#apply`}>
            <span className="ap-course-img"><img src={courseImages[c.slug].src} alt="" loading="lazy" /></span>
            <span className="ap-course-copy"><small>{c.symbol} · {c.tag}</small><b>{c.title}</b></span>
            <ArrowUpRight size={18} className="ap-course-go" />
          </Link>)}
        </div>
      </div>
    </section>
  </main>;
}
