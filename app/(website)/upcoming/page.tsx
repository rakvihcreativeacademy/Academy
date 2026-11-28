import type { CSSProperties } from 'react';
import { ArrowUpRight, BellRing, CalendarClock, Sparkles } from 'lucide-react';
import Link from '@/components/SiteLink';
import { isCourseEnabled, resolveCourseStatus } from '@/lib/cms/schema';
import { getPageContent } from '@/lib/cms/server';
import { courseImages } from '@/lib/course-images';
import { fontVars, heroFontVars } from '@/lib/fonts';
import styles from './upcoming.module.css';
import NeonHero from '@/components/p/NeonHero';

export const metadata = { title: 'Upcoming Courses' };
export const revalidate = 300;

export default async function UpcomingPage() {
  const { sections } = await getPageContent('courses');
  const all = sections.flatMap(section => section.items).filter(isCourseEnabled);
  const courses = all.filter(course => resolveCourseStatus(course) === 'upcoming');
  const live = all.find(course => resolveCourseStatus(course) === 'live');

  return (
    <main className={`pm-page ${styles.page} ${fontVars} ${heroFontVars}`}>
      {/* hero */}
      <NeonHero
        word="Upcoming"
        pill={`${courses.length} new courses on the way`}
        title="What's coming"
        italic="next at RAKVIH"
        lede="New programmes in camera, photography, film, motion, sound, content and AI. Tap Notify me on any course and we'll tell you the moment admissions open."
        image="/images/banners/neon-upcoming.jpg"
        jumps={courses.map((c, i) => ({ id: c.slug || `upcoming-${i}`, label: c.title.replace(/^Professional\s+/i, '') }))}
      >
        <a className={styles.btn} href="#courses">See upcoming courses <ArrowUpRight size={18} /></a>
        {live && <Link className={styles.ghost} href={`/courses${live.slug ? `#${live.slug}` : ''}`}>Join our live course</Link>}
      </NeonHero>

      {/* course cards */}
      <section id="courses" className={styles.list}>
        <div className="pm-wrap">
          {courses.length > 0 ? (
            <div className={styles.cards}>
              {courses.map((course, index) => {
                const artwork = courseImages[course.slug ?? ''];
                const image = course.image || artwork?.src;
                const topics = (course.details ?? []).slice(0, 4);
                return (
                  <article key={course.slug || `${course.title}-${index}`} id={course.slug || `upcoming-${index}`} className={styles.card} style={{ '--i': index } as CSSProperties}>
                    <div className={styles.media}>
                      {image && <img src={image} alt={artwork?.alt ?? ''} loading="lazy" decoding="async" />}
                      <span className={styles.num}>{String(index + 1).padStart(2, '0')}</span>
                      <span className={styles.soon}><CalendarClock size={13} /> Coming soon</span>
                    </div>
                    <div className={styles.body}>
                      <h2>{course.title}</h2>
                      {course.description && <p>{course.description}</p>}
                      {topics.length > 0 && <ul>{topics.map(t => <li key={t}>{t}</li>)}</ul>}
                      <Link className={styles.notify} href={`/admissions?course=${encodeURIComponent(course.title)}`}>
                        <BellRing size={16} /> Notify me <ArrowUpRight size={16} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className={styles.empty}>No upcoming courses are listed right now.</p>
          )}

          {/* closing CTA */}
          <div className={styles.cta}>
            <Sparkles size={22} aria-hidden="true" />
            <h2>Don&rsquo;t want to wait?</h2>
            <p>Start today with our live Professional Video Editing course: 45 days, live project training and trainer assistance.</p>
            <Link className={styles.btn} href="/courses#video-editing">View the live course <ArrowUpRight size={18} /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
