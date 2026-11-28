import type { CSSProperties } from 'react';
import {
  ArrowRight, ArrowUpRight, Award, AudioLines, CalendarDays, Clapperboard, Film, MonitorPlay,
  Palette, Play, Scissors, Smartphone, UserCheck,
} from 'lucide-react';
import { fontVars, heroFontVars } from '@/lib/fonts';
import Link from '@/components/SiteLink';
import CourseRail, { type RailCourse } from '@/components/p/CourseRail';
import { getPageContent } from '@/lib/cms/server';
import { isCourseEnabled, resolveCourseStatus } from '@/lib/cms/schema';
import { formatInr } from '@/lib/payments';
import { getVideoEditingOffering } from '@/lib/payments-server';
import EditingImagePreview from './EditingImagePreview';
import styles from './home-motion.module.css';


/** Shared section header: yellow pill label, big heading, short description. */
function Head({ id, eyebrow, title, text, center, className, children }: { id: string; eyebrow: string; title: string; text?: string; center?: boolean; className?: string; children?: React.ReactNode }) {
  return (
    <header className={`${styles.head} ${center ? styles.headCenter : ''} ${className || ''}`} data-v>
      <div>
        <span className={styles.eyebrow}><i />{eyebrow}</span>
        <h2 id={id}>{title}</h2>
      </div>
      {(text || children) && <div className={styles.headSide}>{text && <p>{text}</p>}{children}</div>}
    </header>
  );
}

/* Premiere Pro video used in the 45-days course section */

/* fallback pictures for courses that have no image set in the admin panel */
const courseImages: Record<string, string> = {
  'video-editing': '/images/banners/editing-timeline.webp',
  cinematography: '/images/course-cinematography.webp',
  photography: '/images/academy-photography.webp',
  filmmaking: '/images/academy-filmmaking.webp',
  'motion-graphics': '/images/course-motion-graphics.webp',
  'lighting-sound': '/images/course-lighting-sound.webp',
  'content-creation': '/images/course-content-creation.webp',
  'ai-creative': '/images/course-ai-creative.webp',
};

const phases = [
  { icon: MonitorPlay, title: 'Foundations', text: 'Premiere Pro interface, media management and your first clean cuts.' },
  { icon: Scissors, title: 'Story & pace', text: 'Editing techniques, transitions, rhythm and structure.' },
  { icon: Palette, title: 'Colour & sound', text: 'Colour correction and grading, audio sync and sound editing.' },
  { icon: Smartphone, title: 'Real formats', text: 'Reels, YouTube, wedding and commercial edits.' },
  { icon: Award, live: true, title: 'Live project', text: 'Edit a real project with trainer assistance, then receive your certificate.' },
];

const included = [
  { icon: CalendarDays, text: '45-days training program' },
  { icon: Clapperboard, text: 'Live project training' },
  { icon: UserCheck, text: 'Trainer assistance throughout' },
  { icon: MonitorPlay, text: 'Adobe Premiere Pro workflow' },
  { icon: Film, text: 'Portfolio-ready final edit' },
  { icon: Award, text: 'RAKVIH course-completion certificate' },
];

const faqs = [
  { q: 'What software will I learn?', a: 'The course is built around Adobe Premiere Pro, covering editing, colour correction and grading, and sound editing.' },
  { q: 'What is the live project?', a: 'You will edit a real project from raw footage to final export, with your trainer guiding and reviewing your work at each stage.' },
  { q: 'Do I get a certificate?', a: 'Yes. When you complete the program you receive a RAKVIH course-completion certificate.' },
  { q: 'Is a job guaranteed after the course?', a: 'No. We offer placement assistance, subject to available opportunities. The live project and your final edits give you portfolio work to show.' },
  { q: 'How do I join the next batch?', a: 'Use the Join button on this page, or message us on WhatsApp and we will share the batch dates.' },
];

const editingSkills = [
  { key: 'edit', icon: Scissors, title: 'Edit', text: 'Trim clips and arrange them into a sequence that tells a clear story.' },
  { key: 'audio', icon: AudioLines, title: 'Audio', text: 'Clean up dialogue and balance music and sound effects.' },
  { key: 'coloring', icon: Palette, title: 'Coloring', text: 'Correct exposure, match shots, and grade colour to set the mood.' },
  { key: 'effects', icon: Film, title: 'Effects', text: 'Add titles, transitions and motion where they support the edit.' },
];

export default async function Home() {
  const [catalogue, offering] = await Promise.all([getPageContent('courses'), getVideoEditingOffering()]);
  const course = catalogue.sections.flatMap(section => section.items)
    .find(item => item.slug === offering.slug && isCourseEnabled(item));
  const canJoin = Boolean(course && resolveCourseStatus(course) === 'live' && offering.is_live && offering.enrollments_enabled);
  const detailsHref = course ? '/courses#video-editing' : '/upcoming';
  const joinHref = canJoin ? '/admissions#apply' : '/contact?type=admission#enquire';
  const joinLabel = canJoin ? 'Join the next batch' : 'Ask about the next batch';
  const fee = formatInr(offering.price_inr);
  const allCourses = catalogue.sections.flatMap(section => section.items).filter(isCourseEnabled);
  const scrollCourses: RailCourse[] = allCourses.map(item => {
    const upcoming = resolveCourseStatus(item) === 'upcoming';
    return {
      name: item.title,
      caption: item.description,
      image: item.image || courseImages[item.slug || ''] || '/images/banners/home-editing-first-v2.webp',
      href: upcoming ? '/upcoming' : `/courses${item.slug ? `#${item.slug}` : ''}`,
      upcoming,
    };
  });

  const upcomingNames = scrollCourses.filter(c => c.upcoming).map(c => c.name);

  return (
    <main className={`${styles.home} ${fontVars} ${heroFontVars}`} data-home-page>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className={styles.hero} aria-labelledby="home-title" data-media>
        <img className={styles.heroScene} src="/images/banners/edit-suite-with-editor.jpg" alt="" width={1672} height={941} fetchPriority="high" />
        <span className={styles.heroGrid} aria-hidden="true" />
        <div className={`pm-wrap ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <Link href={detailsHref} className={styles.heroPill}>
              <span className={canJoin ? 'rk-live' : undefined}>{canJoin ? 'Live' : 'Training'}</span> 45-Days Course
            </Link>
            <h1 id="home-title" className={styles.heroTitle}>
              Professional <em>Video Editing</em>
            </h1>
            <p className={styles.heroSub}>
              Learn to cut, colour grade and mix sound in Adobe Premiere Pro. Edit a live project with trainer support and earn a certificate on completion.
            </p>
            <div className={styles.heroBtns}>
              <Link className={styles.heroPrimary} href={joinHref}>{canJoin ? 'Join now' : 'Ask about training'} <ArrowUpRight size={18} /></Link>
              <Link className={styles.heroSecondary} href={detailsHref}>Explore the course</Link>
            </div>
            <ul className={styles.heroStats}>
              <li><strong>45</strong><span>Days program</span></li>
              <li><strong>Live</strong><span>Project training</span></li>
              <li><strong>{fee}</strong><span>Course fee</span></li>
            </ul>
          </div>
        </div>
        <span className={styles.scrollCue} aria-hidden="true"><i /></span>
      </section>

      {/* ── How the 45 days flow ─────────────────────────────── */}
      <section className={`${styles.sec} ${styles.secB}`} aria-labelledby="roadmap-title" data-media>
        <div className="pm-wrap">
          <Head id="roadmap-title" eyebrow="The 45-days journey" title="How the 45 days flow." text="Each stage builds on the last, and ends with a real project and your certificate." />
          <ol className={styles.phases}>
            {phases.map(({ icon: Icon, title, text, live }, i) => (
              <li key={title} className={styles.reveal} data-live={live} data-v style={{ '--i': i } as CSSProperties}>
                <div className={styles.phaseTop}>
                  <span className={styles.phaseNum}>{String(i + 1).padStart(2, '0')}</span>
                  <Icon size={20} aria-hidden="true" />
                </div>
                <h3>{live && <span className={styles.projectLiveDot} aria-hidden="true" />}{title}</h3>
                <p>{text}</p>
                <span className={styles.phaseBar} aria-hidden="true"><i style={{ width: `${((i + 1) / phases.length) * 100}%` }} /></span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Courses: horizontal neon poster rail ───────────────── */}
      <section className={`${styles.sec} ${styles.coursesSec}`} aria-labelledby="courses-title" data-media>
        <div className="pm-wrap">
          <Head id="courses-title" className={`${styles.headStack} ${styles.headGlow}`} center eyebrow={`${scrollCourses.length} courses · live & upcoming`} title="The right course for any story." text="Professional training across editing, camera, photography, film and more. Start with our live course, and see what's coming next.">
            <Link className={styles.textLink} href="/courses">View all courses <ArrowRight size={16} /></Link>
          </Head>
          <CourseRail courses={scrollCourses} />
        </div>
      </section>

      {/* ── 45-days Video Editing course (middle of the page) ─── */}
      <section id="course-plan" className={`${styles.sec} ${styles.secB}`} aria-labelledby="course-title" data-media>
        <div className="pm-wrap">
          <div className={`${styles.showcase} ${styles.reveal}`} data-v>
            <div className={styles.showVideo}>
              <EditingImagePreview />
            </div>
            <div className={styles.showCopy}>
              <span className={styles.eyebrow}><i />{canJoin ? 'Live course · Enrolling now' : 'Live course · Next batch'}</span>
              <h2 id="course-title">{course?.title || offering.title}</h2>
              <p className={styles.showSub}>Find the story in every frame. Turn raw footage into work that moves people.</p>
              <ul className={styles.showList}>
                <li><span><CalendarDays size={18} aria-hidden="true" /></span><div><strong>45-Days Training Program</strong>From your first cut to a finished edit</div></li>
                <li><span><Clapperboard size={18} aria-hidden="true" /></span><div><strong>Live project training</strong>Edit a real project, start to export</div></li>
                <li><span><UserCheck size={18} aria-hidden="true" /></span><div><strong>Trainer assistance</strong>Guidance and feedback at every stage</div></li>
                <li><span><Award size={18} aria-hidden="true" /></span><div><strong>Certificate in 45 days</strong>RAKVIH course-completion certificate</div></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Plans: live + upcoming, two columns ─────────────── */}
      <section id="plans" className={`${styles.sec} ${styles.secB}`} aria-labelledby="plans-title" data-media>
        <div className="pm-wrap">
          <Head id="plans-title" className={`${styles.headStack} ${styles.headGlow}`} center eyebrow="Plans" title="Choose your plan." text="Start with our live course today, or reserve your place in the upcoming program." />
          <div className={styles.plans}>
            <article className={`${styles.planCard} ${styles.planLive} ${styles.reveal}`} data-v>
              <span className={styles.planTagLive}><i /> Live now</span>
              <h3>{course?.title || offering.title}</h3>
              <p className={styles.planText}>45-Day Training Program · Live Project Training with Trainer Assistance</p>
              <div className={styles.planPrice}><strong>{fee}</strong><span>one-time course fee</span></div>
              <ul className={styles.simpleList}>
                <li>Adobe Premiere Pro workflow</li>
                <li>Colour grading &amp; sound editing</li>
                <li>Live project with trainer assistance</li>
                <li>RAKVIH course-completion certificate</li>
              </ul>
              <Link className={styles.btnSun} href={joinHref}>{joinLabel} <ArrowUpRight size={18} /></Link>
            </article>
            <article className={`${styles.planCard} ${styles.reveal}`} data-v style={{ '--i': 1 } as CSSProperties}>
              <span className={styles.planTagSoon}>Upcoming</span>
              <h3>Upcoming Program</h3>
              <p className={styles.planText}>Our next courses, launching soon. Reserve your place to hear about dates first.</p>
              <div className={styles.planPrice}><strong>₹59,999</strong><span>course fee</span></div>
              <ul className={styles.simpleList}>
                {upcomingNames.slice(0, 4).map(n => <li key={n}>{n}</li>)}
              </ul>
              <Link className={styles.planGhost} href="/upcoming">See upcoming dates <ArrowUpRight size={18} /></Link>
            </article>
          </div>
        </div>
      </section>
      <section id="start-creating" className={`${styles.sec} ${styles.creating}`} aria-labelledby="start-creating-title">
        <div className="pm-wrap">
          <h2 id="start-creating-title">Start Creating in a Simple Way</h2>
          <p className={styles.creatingIntro}>Build a polished video in Adobe Premiere Pro, one step at a time. Start with the cut, then refine the sound, colour and effects.</p>
          <div className={styles.creatingGrid}>
            {editingSkills.map(({ key, icon: Icon, title, text }) => (
              <article key={key} className={styles.creatingCard}>
                <img src={`/images/banners/creating-${key}.jpg`} alt="" width={1536} height={1024} loading="lazy" decoding="async" />
                <div>
                  <h3><Icon size={19} aria-hidden="true" />{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
