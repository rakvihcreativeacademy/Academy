import { ArrowUpRight } from 'lucide-react';
import Link from '@/components/SiteLink';
import { formatInr, type CourseOffering } from '@/lib/payments';
import { courseImages } from '@/lib/course-images';

export type LiveCourseCardItem = {
  slug: string;
  title: string;
  description: string;
  highlights: string[];
  href: string;
  image?: string;
  imageAlt?: string;
  batchLabel?: string;
  durationLabel?: string;
  priceInr?: number;
};

function SparkleMark() {
  return (
    <svg className="pm-live-star" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M12 2.2c.55 4.95 4.85 9.25 9.8 9.8-4.95.55-9.25 4.85-9.8 9.8-.55-4.95-4.85-9.25-9.8-9.8 4.95-.55 9.25-4.85 9.8-9.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Centered dark-studio showcase card for the currently live course(s) on the homepage.
 * Replaces the homepage enquiry form with a focused Apply Now spotlight.
 */
export default function LiveCourseCard({
  courses,
  videoEditingOffering,
}: {
  courses: LiveCourseCardItem[];
  videoEditingOffering?: CourseOffering;
}) {
  if (!courses.length) return null;

  return (
    <section className="pm-live-sec" id="live-course" data-dark aria-labelledby="live-course-heading">
      <div className="pm-live-ambient" aria-hidden="true" />
      <div className="pm-wrap pm-live-wrap">
        <div className="pm-live-head" data-v>
          <span className="pm-live-eyebrow">
            <i aria-hidden="true" />
            Now Enrolling · RAKVIH Digital
          </span>
          <h2 id="live-course-heading" className="pm-live-heading">
            {courses.length === 1 ? 'Live Course' : 'Live Courses'}
          </h2>
        </div>

        <div className={'pm-live-grid' + (courses.length > 1 ? ' multi' : '')}>
          {courses.map(course => {
            const isVideoEditing = course.slug === 'video-editing' || /professional video editing/i.test(course.title);
            const fee = isVideoEditing && videoEditingOffering ? videoEditingOffering.price_inr : course.priceInr;
            const batch = isVideoEditing && videoEditingOffering ? videoEditingOffering.batch_label : (course.batchLabel || 'Next batch enrolling now');
            const duration = isVideoEditing && videoEditingOffering ? videoEditingOffering.duration_label : course.durationLabel;
            const bullets = course.highlights.filter(Boolean).slice(0, 6);
            const img = course.image || courseImages[course.slug]?.src || '/images/banners/editing-colour.webp';
            const imgAlt = course.imageAlt || courseImages[course.slug]?.alt || course.title;

            return (
              <article key={course.slug || course.title} className="pm-lc" data-v>
                <div className="pm-lc-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={imgAlt} loading="lazy" />
                  <span className="pm-live-badge pm-lc-badge"><i aria-hidden="true" />Live Now</span>
                  {duration && <span className="pm-lc-duration">{duration}</span>}
                </div>

                <div className="pm-lc-body">
                  <h3 className="pm-lc-title">{course.title}</h3>
                  <p className="pm-lc-sub">{course.description}</p>
                  {bullets.length > 0 && (
                    <div className="pm-lc-skills">
                      <span className="pm-lc-label">What you&apos;ll learn</span>
                      <ul>
                        {bullets.map((point, idx) => (
                          <li key={idx}><SparkleMark />{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <aside className="pm-lc-aside">
                  {fee ? (
                    <div className="pm-lc-fee">
                      <span className="pm-lc-label">Course fee</span>
                      <strong>{formatInr(fee)}</strong>
                    </div>
                  ) : null}
                  <p className="pm-lc-batch"><i aria-hidden="true" />{batch}</p>
                  <Link href={course.href || `/admissions?course=${encodeURIComponent(course.title)}`} className="pm-lc-cta">
                    <span>Apply Now</span>
                    <ArrowUpRight size={17} />
                  </Link>
                  <Link href={`/courses#${course.slug || 'course-list'}`} className="pm-lc-more">
                    Explore full curriculum
                  </Link>
                </aside>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
