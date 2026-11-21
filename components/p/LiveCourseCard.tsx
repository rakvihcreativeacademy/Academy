import { ArrowUpRight } from 'lucide-react';
import Link from '@/components/SiteLink';
import { formatInr, type CourseOffering } from '@/lib/payments';

export type LiveCourseCardItem = {
  slug: string;
  title: string;
  description: string;
  highlights: string[];
  href: string;
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

            return (
              <article key={course.slug || course.title} className="pm-live-card" data-v>
                <div className="pm-live-card-top">
                  <span className="pm-live-badge"><i aria-hidden="true" />Live Now</span>
                  {duration && <span className="pm-live-meta">{duration}</span>}
                </div>

                <h3 className="pm-live-title">{course.title}</h3>
                <p className="pm-live-sub">{course.description}</p>

                {fee ? (
                  <div className="pm-live-price">
                    <span>{batch}</span>
                    <strong>{formatInr(fee)}</strong>
                  </div>
                ) : null}

                {bullets.length > 0 && (
                  <ul className="pm-live-list">
                    {bullets.map((point, idx) => (
                      <li key={idx}>
                        <SparkleMark />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="pm-live-foot">
                  <Link href={course.href || `/admissions?course=${encodeURIComponent(course.title)}`} className="pm-live-cta">
                    <span>Apply Now</span>
                    <ArrowUpRight size={16} />
                  </Link>
                  <Link href={`/courses#${course.slug || 'course-list'}`} className="pm-live-more">
                    Explore full curriculum
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
