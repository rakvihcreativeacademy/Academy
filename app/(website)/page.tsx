import Link from '@/components/SiteLink';
import { ArrowUpRight } from 'lucide-react';
import Hero from '@/components/p/Hero';
import VideographyStage from '@/components/p/VideographyStage';
import CourseIndex, { type CourseIndexItem } from '@/components/p/CourseIndex';
import LiveCourseCard, { type LiveCourseCardItem } from '@/components/p/LiveCourseCard';
import VideoFeeds from '@/components/p/VideoFeeds';
import Words from '@/components/v/Words';
import Pillars from '@/components/p/Pillars';
import ShootEdit from '@/components/p/ShootEdit';
import { courses as staticCourses } from '@/lib/courses';
import { courseImages } from '@/lib/course-images';
import { getPageContent } from '@/lib/cms/server';
import { isCourseEnabled, resolveCourseStatus } from '@/lib/cms/schema';
import { getVideoEditingOffering } from '@/lib/payments-server';
import { getPublicVideoFeeds } from '@/lib/video-feeds-server';
import { productionServices } from '@/lib/site';

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

export default async function Home() {
  const [courseDoc, videoEditingOffering, videoFeeds] = await Promise.all([
    getPageContent('courses'),
    getVideoEditingOffering(),
    getPublicVideoFeeds(),
  ]);
  const hasVideoFeeds = videoFeeds.settings.section_enabled && (videoFeeds.youtube.length > 0 || videoFeeds.instagram.length > 0);

  const cmsItems = courseDoc.sections.flatMap(s => s.items);
  const activeItems = cmsItems.filter(it => isCourseEnabled(it));

  const courseIndexItems: CourseIndexItem[] = activeItems.map((it, idx) => {
    const fallback = staticCourses.find(c => c.slug === it.slug) ?? staticCourses[idx];
    const slug = it.slug || fallback?.slug || `course-${idx + 1}`;
    const imgFallback = courseImages[slug];
    return {
      slug,
      title: it.title,
      tag: fallback?.tag || 'Creative discipline',
      symbol: String(idx + 1).padStart(2, '0'),
      description: it.description,
      skills: fallback?.skills ?? it.details.filter(Boolean).slice(0, 3),
      image: it.image || imgFallback?.src || '/images/academy-editing.webp',
      imageAlt: imgFallback?.alt || it.title,
      live: resolveCourseStatus(it) === 'live',
    };
  });

  const liveCourses: LiveCourseCardItem[] = activeItems
    .filter(it => resolveCourseStatus(it) === 'live')
    .map((it, idx) => {
      const slug = it.slug || `course-${idx + 1}`;
      return {
        slug,
        title: it.title,
        description: it.description,
        highlights: it.details.filter(Boolean).slice(0, 6),
        href: it.href || `/admissions?course=${encodeURIComponent(it.title)}`,
      };
    });

  const disciplineCount = activeItems.length || staticCourses.length;

  return <main className="pm-home">
    <Hero />

    {/* Key stats strip */}
    <section className="pm-sec pm-paper pm-stats-band">
      <div className="pm-wrap">
        <div className="pm-stats">
          <div data-v><strong className="pm-num">{String(disciplineCount).padStart(2, '0')}</strong><span>Professional courses</span></div>
          <div data-v><strong className="pm-num">01</strong><span>Premium podcast studio</span></div>
          <div data-v><strong className="pm-num">{productionServices.length}</strong><span>Production services</span></div>
          <div data-v><strong className="pm-num">04</strong><span>Steps to a finished portfolio</span></div>
        </div>
      </div>
    </section>

    {/* (02) — Videography (3D Sony Alpha G Master burst + lens dive) */}
    <VideographyStage label="(02)" />

    {/* (03) — Programmes (above Shoot & Edit) */}
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
        <CourseIndex items={courseIndexItems} />
      </div>
    </section>

    {/* (04) — Shoot & Edit (3D) */}
    <ShootEdit label="(04)" />

    {/* (05) — Method */}
    <section className="pm-sec pm-paper2" style={{ overflow: 'hidden' }}>
      <div className="pm-wrap">
        <div className="pm-head-row">
          <div data-v>
            <p className="pm-label rule">(05) — <b>The Method</b></p>
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

    {/* (06) — Video Feeds (YouTube & Instagram, managed from Admin) */}
    <VideoFeeds feeds={videoFeeds} label="(06)" />

    {/* Standard */}
    <section className="pm-sec pm-paper">
      <div className="pm-wrap">
        <div className="pm-head-row">
          <div data-v>
            <p className="pm-label rule">{hasVideoFeeds ? '(07)' : '(06)'} — <b>Why choose RAKVIH Digital?</b></p>
            <h2 className="pm-h2"><Words text="Everything you need" /> <em><Words text="to grow as a creator." start={3} /></em></h2>
          </div>
          <p className="pm-lede">Practical learning, professional tools, a real studio and a portfolio at the end of it.</p>
        </div>
        <Pillars />
      </div>
    </section>

    {/* Live Course Apply Now Spotlight (homepage only) */}
    <LiveCourseCard courses={liveCourses} videoEditingOffering={videoEditingOffering} />
  </main>;
}
