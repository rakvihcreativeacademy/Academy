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
import StatsStrip from '@/components/p/StatsStrip';
import { courses as staticCourses } from '@/lib/courses';
import { courseImages } from '@/lib/course-images';
import { getPageContent } from '@/lib/cms/server';
import { isCourseEnabled, resolveCourseStatus } from '@/lib/cms/schema';
import { getVideoEditingOffering } from '@/lib/payments-server';
import { getPublicVideoFeeds } from '@/lib/video-feeds-server';
import { productionServices } from '@/lib/site';

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
        <StatsStrip stats={[
          { value: disciplineCount, label: 'Professional courses', note: 'Editing, cinema, photo, motion & AI', href: '/courses', icon: 'course' },
          { value: 1, label: 'Premium podcast studio', note: 'Multi-camera, treated, ready to record', href: '/podcast-studio', icon: 'mic' },
          { value: productionServices.length, label: 'Production services', note: 'From brand films to social reels', href: '/production', icon: 'clap' },
        ]} />
      </div>
    </section>

    {/* (01) — Videography (3D Sony Alpha G Master burst + lens dive) */}
    <VideographyStage label="(01)" />

    {/* (02) — Programmes (above Shoot & Edit) */}
    <section className="pm-sec pm-dark" data-dark>
      <div className="pm-wrap">
        <div className="pm-head-row pm-head-row--ci">
          <div data-v>
            <p className="pm-label rule">(02) — <b>The Programmes</b></p>
            <h2 className="pm-h2"><Words text="Eight disciplines." /> <em><Words text="One creative career." start={2} /></em></h2>
          </div>
          <Link href="/courses" className="pm-viewall">
            <span className="pm-viewall-count">{String(disciplineCount).padStart(2, '0')}</span>
            <span className="pm-viewall-t">View all courses</span>
            <span className="pm-viewall-go"><ArrowUpRight size={16} /></span>
          </Link>
        </div>
        <CourseIndex items={courseIndexItems} />
      </div>
    </section>

    {/* (03) — Shoot & Edit (3D) */}
    <ShootEdit label="(03)" />

    {/* Live Course Apply Now Spotlight — sits right under Shoot & Edit */}
    <LiveCourseCard courses={liveCourses} videoEditingOffering={videoEditingOffering} />

    {/* (04) — Video Feeds (YouTube & Instagram, managed from Admin) */}
    <VideoFeeds feeds={videoFeeds} label="(04)" />

    {/* Standard */}
    <section className="pm-sec pm-paper">
      <div className="pm-wrap">
        <div className="pm-head-row">
          <div data-v>
            <p className="pm-label rule">{hasVideoFeeds ? '(05)' : '(04)'} — <b>Why choose RAKVIH Digital?</b></p>
            <h2 className="pm-h2"><Words text="Everything you need" /> <em><Words text="to grow as a creator." start={3} /></em></h2>
          </div>
        </div>
        <Pillars />
      </div>
    </section>
  </main>;
}
