import type { Metadata } from 'next';
import { ArrowUpRight, MapPin, Check, Clock, ShieldCheck } from 'lucide-react';
import Link from '@/components/SiteLink';
import EnrollmentForm from '@/components/EnrollmentForm';
import { getVideoEditingOffering } from '@/lib/payments-server';
import { getPageContent } from '@/lib/cms/server';
import { isCourseEnabled, resolveCourseStatus } from '@/lib/cms/schema';
import { formatInr } from '@/lib/payments';
import { courses as staticCourses } from '@/lib/courses';
import { courseImages } from '@/lib/course-images';
import { site } from '@/lib/site';

export const metadata: Metadata = { title: 'Apply Now' };
const stages = [
  { t: 'Complete your enrollment & KYC', d: 'Fill in your student profile and upload your Aadhaar card for verification.' },
  { t: 'Pay programme fee securely', d: 'Complete payment online through Razorpay via UPI, card, or netbanking.' },
  { t: 'Admin review & portal access', d: 'Our admissions team reviews your details, approves your seat, and sets up your student login.' },
];

export const revalidate = 300;
export default async function Admissions() {
  const [offering, courseDoc] = await Promise.all([
    getVideoEditingOffering(),
    getPageContent('courses'),
  ]);

  const activeCourses = courseDoc.sections
    .flatMap(s => s.items)
    .filter(it => isCourseEnabled(it))
    .map((it, idx) => {
      const fallback = staticCourses.find(c => c.slug === it.slug) ?? staticCourses[idx];
      const slug = it.slug || fallback?.slug || `course-${idx + 1}`;
      return {
        slug,
        symbol: String(idx + 1).padStart(2, '0'),
        tag: fallback?.tag || 'Creative discipline',
        title: it.title,
        image: it.image || courseImages[slug]?.src || '/images/banners/editing-colour.webp',
        live: resolveCourseStatus(it) === 'live',
      };
    });

  return <main className="pm-page ap-page">
    <section className="ap-hero" data-hero data-dark id="apply">
      <img className="ap-bg" src="/images/course-content-creation.webp" alt="" aria-hidden="true" />
      <div className="pm-wrap ap-grid">
        <div className="ap-copy">
          <p className="pm-label on-dark"><span className="pm-dot" /> Live Admissions — {site.location.split(',')[0]}</p>
          <h1>Enroll in <em>Professional Video Editing.</em></h1>
          <p className="ap-lede">
            Admissions are now live for our flagship <strong>{offering.title}</strong> programme ({formatInr(offering.price_inr)}). Complete your enrollment form, upload your Aadhaar for verification, and pay securely online.
          </p>
        </div>
        <div className="ap-more">
          <ol className="ap-steps">{stages.map((s, i) => <li key={s.t}><span>{String(i + 1).padStart(2, '0')}</span><div><b>{s.t}</b><small>{s.d}</small></div></li>)}</ol>
          <ul className="ap-perks">{['45-Days Training Program', 'Live project training with trainer assistance', 'Get Training Certificate in 45 days', 'Beginners welcome'].map(x => <li key={x}><Check size={14} />{x}</li>)}</ul>
          <div className="ap-contact">
            <span><ShieldCheck size={16} /> Admin-verified student onboarding</span>
            <span><MapPin size={16} /> {site.location}</span>
          </div>
        </div>
        <div className="pm-form-card ap-card ap-enroll-card">
          <header>
            <div>
              <p className="pm-label"><span className="pm-dot" /> Online Enrollment</p>
              <h3>Apply &amp; Enroll Today.</h3>
            </div>
            <img src="/brand/rakvih-mark-128.png" alt="" />
          </header>
          <EnrollmentForm offering={offering} />
        </div>
      </div>
    </section>

    <section className="pm-sec pm-paper">
      <div className="pm-wrap">
        <div className="pm-head-row">
          <div><p className="pm-label rule" style={{ marginBottom: 18 }}>Programmes status</p><h2 className="pm-h2">Video Editing is <em>live now.</em></h2></div>
        </div>
        <div className="ap-courses">
          {activeCourses.map(c => {
            const isVideoEditing = c.slug === 'video-editing';
            if (c.live) {
              return <Link key={c.slug} className="ap-course is-live" data-v href={isVideoEditing ? '#apply' : `/courses#${c.slug}`}>
                <span className="ap-course-img"><img src={c.image} alt={c.title} loading="lazy" /></span>
                <span className="ap-course-copy">
                  <small>{c.symbol} · {c.tag}</small>
                  <b>{c.title}</b>
                  <span className="cs-pill is-live" style={{ marginTop: 4 }}><i aria-hidden="true" />{isVideoEditing ? `Live · ${formatInr(offering.price_inr)}` : 'Live'}</span>
                </span>
                <ArrowUpRight size={18} className="ap-course-go" />
              </Link>;
            }
            return <div key={c.slug} className="ap-course is-soon" data-v aria-disabled="true">
              <span className="ap-course-img"><img src={c.image} alt={c.title} loading="lazy" /></span>
              <span className="ap-course-copy">
                <small>{c.symbol} · {c.tag}</small>
                <b>{c.title}</b>
                <span className="cs-pill is-upcoming" style={{ marginTop: 4 }}><Clock size={11} />Coming soon</span>
              </span>
            </div>;
          })}
        </div>
      </div>
    </section>
  </main>;
}
