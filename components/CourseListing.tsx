'use client';
import { useState } from 'react';
import {
  Search, ArrowUpRight, CreditCard, Clock, X, ChevronDown,
  Scissors, Sliders, Palette, AudioLines, Film, Camera, Aperture, Focus,
  Frame, Compass, Sun, Lightbulb, Mic, Volume2, Sparkles, Clapperboard,
  FileText, LayoutGrid, Video, Smartphone, Megaphone, Wand2, Layers,
  Captions, Workflow, User, Package, Calendar, Briefcase, Eye, Radio,
  SlidersHorizontal, Check,
} from 'lucide-react';
import Link from '@/components/SiteLink';
import { isCourseEnabled, resolveCourseStatus, type PageContent } from '@/lib/cms/schema';
import { DEFAULT_VIDEO_EDITING_OFFERING, formatInr, type CourseOffering } from '@/lib/payments';
import VideoEditingCheckout from '@/components/VideoEditingCheckout';

/** Official-style brand marks for creative tools and matched Lucide icons for skills. */
function ModuleIcon({ label }: { label: string }) {
  const s = label.toLowerCase();

  // Official software & platform marks
  if (s.includes('premiere')) {
    return (
      <span className="pm-mod-ico brand" title="Adobe Premiere Pro" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <rect width="24" height="24" rx="5" fill="#00005B" />
          <text x="12" y="16" textAnchor="middle" fill="#9999FF" fontSize="11.5" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">Pr</text>
        </svg>
      </span>
    );
  }
  if (s.includes('after effects')) {
    return (
      <span className="pm-mod-ico brand" title="Adobe After Effects" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <rect width="24" height="24" rx="5" fill="#00005B" />
          <text x="12" y="16" textAnchor="middle" fill="#9999FF" fontSize="11" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">Ae</text>
        </svg>
      </span>
    );
  }
  if (s.includes('lightroom') && s.includes('photoshop')) {
    return (
      <span className="pm-mod-ico brand" title="Lightroom & Photoshop" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <rect width="24" height="24" rx="5" fill="#001E36" />
          <text x="12" y="16" textAnchor="middle" fill="#31A8FF" fontSize="10.5" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">Lr</text>
        </svg>
      </span>
    );
  }
  if (s.includes('photoshop')) {
    return (
      <span className="pm-mod-ico brand" title="Adobe Photoshop" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <rect width="24" height="24" rx="5" fill="#001E36" />
          <text x="12" y="16" textAnchor="middle" fill="#31A8FF" fontSize="11" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">Ps</text>
        </svg>
      </span>
    );
  }
  if (s.includes('davinci')) {
    return (
      <span className="pm-mod-ico brand" title="DaVinci Resolve" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <rect width="24" height="24" rx="5" fill="#181A20" />
          <circle cx="12" cy="8.2" r="3.4" fill="#FF4B4B" opacity="0.95" />
          <circle cx="8.6" cy="14.4" r="3.4" fill="#2ECC71" opacity="0.95" />
          <circle cx="15.4" cy="14.4" r="3.4" fill="#3B82F6" opacity="0.95" />
          <circle cx="12" cy="12.2" r="1.5" fill="#181A20" />
        </svg>
      </span>
    );
  }
  if (s.includes('final cut')) {
    return (
      <span className="pm-mod-ico brand" title="Final Cut Pro" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <defs>
            <linearGradient id="fcp-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF3B8D" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
          <rect width="24" height="24" rx="5" fill="url(#fcp-g)" />
          <path d="M5 10.5h14v7.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18v-7.5Z" fill="#fff" fillOpacity="0.92" />
          <path d="M5 8.5 18.2 5.2l.8 2.8-13.2 3.3L5 8.5Z" fill="#fff" />
        </svg>
      </span>
    );
  }
  if (s.includes('instagram')) {
    return (
      <span className="pm-mod-ico brand" title="Instagram Reels" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <defs>
            <linearGradient id="ig-g" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#FEDA75" />
              <stop offset="45%" stopColor="#FA7E1E" />
              <stop offset="75%" stopColor="#D62976" />
              <stop offset="100%" stopColor="#4F5BD5" />
            </linearGradient>
          </defs>
          <rect width="24" height="24" rx="6" fill="url(#ig-g)" />
          <rect x="6" y="6" width="12" height="12" rx="3.5" fill="none" stroke="#fff" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="2.7" fill="none" stroke="#fff" strokeWidth="1.6" />
          <circle cx="15.8" cy="8.2" r="0.9" fill="#fff" />
        </svg>
      </span>
    );
  }
  if (s.includes('youtube') && !s.includes('reels')) {
    return (
      <span className="pm-mod-ico brand" title="YouTube" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <rect width="24" height="24" rx="5" fill="#FF0000" />
          <polygon points="10,8.2 16.5,12 10,15.8" fill="#fff" />
        </svg>
      </span>
    );
  }

  // Matched Lucide icons for skills & concepts
  let Icon = Check;
  if (s.includes('subtitles') || s.includes('captions')) Icon = Captions;
  else if (s.includes('voiceover') || s.includes('microphone') || s.includes('audio recording')) Icon = Mic;
  else if (s.includes('noise') || s.includes('mixing')) Icon = SlidersHorizontal;
  else if (s.includes('audio') || s.includes('sound')) Icon = AudioLines;
  else if (s.includes('colour') || s.includes('color') || s.includes('grading')) Icon = Palette;
  else if (s.includes('transition') || s.includes('pacing')) Icon = Sliders;
  else if (s.includes('ai-powered') || s.includes('workflow')) Icon = Workflow;
  else if (s.includes('ai ')) Icon = Sparkles;
  else if (s.includes('reels') || s.includes('social media') || s.includes('influencer')) Icon = Smartphone;
  else if (s.includes('wedding') || s.includes('event')) Icon = Calendar;
  else if (s.includes('commercial') || s.includes('corporate') || s.includes('advertisements')) Icon = Megaphone;
  else if (s.includes('editing')) Icon = Scissors;
  else if (s.includes('cinema camera') || s.includes('video')) Icon = Video;
  else if (s.includes('lens')) Icon = Aperture;
  else if (s.includes('exposure') || s.includes('focus')) Icon = Focus;
  else if (s.includes('composition') || s.includes('framing') || s.includes('shot planning')) Icon = Frame;
  else if (s.includes('movement') || s.includes('gimbal') || s.includes('tripod')) Icon = Compass;
  else if (s.includes('portrait')) Icon = User;
  else if (s.includes('product')) Icon = Package;
  else if (s.includes('natural lighting')) Icon = Sun;
  else if (s.includes('lighting') || s.includes('led')) Icon = Lightbulb;
  else if (s.includes('script') || s.includes('story development')) Icon = FileText;
  else if (s.includes('storyboard')) Icon = LayoutGrid;
  else if (s.includes('direction') || s.includes('film')) Icon = Clapperboard;
  else if (s.includes('production management') || s.includes('planning')) Icon = Briefcase;
  else if (s.includes('green screen') || s.includes('visual effects') || s.includes('motion') || s.includes('animation')) Icon = Wand2;
  else if (s.includes('camera') || s.includes('shooting') || s.includes('photography')) Icon = Camera;
  else if (s.includes('documentary')) Icon = Film;
  else if (s.includes('broadcast') || s.includes('podcast')) Icon = Radio;
  else if (s.includes('visual')) Icon = Eye;
  else if (s.includes('layer')) Icon = Layers;
  else if (s.includes('volume')) Icon = Volume2;

  return (
    <span className="pm-mod-ico" aria-hidden="true">
      <Icon size={14} strokeWidth={2} />
    </span>
  );
}

/** Course catalogue as a run of editorial spreads: plate, title, description and the full module list. */
export default function CourseListing({
  sections,
  videoEditingOffering = DEFAULT_VIDEO_EDITING_OFFERING,
}: {
  sections: PageContent['sections'];
  videoEditingOffering?: CourseOffering;
}) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming'>('all');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const q = query.trim().toLowerCase();
  const visibleSections = sections.map(section => ({
    ...section,
    items: section.items.filter(item => isCourseEnabled(item)),
  }));
  const total = visibleSections.reduce((n, s) => n + s.items.length, 0);
  const liveTotal = visibleSections.reduce((n, s) => n + s.items.filter(it => resolveCourseStatus(it) === 'live').length, 0);
  const upcomingTotal = total - liveTotal;

  const filtered = visibleSections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      const st = resolveCourseStatus(item);
      if (statusFilter !== 'all' && st !== statusFilter) return false;
      if (!q) return true;
      return [item.title, item.description, ...item.details, st].join(' ').toLowerCase().includes(q);
    }),
  }));
  const shown = filtered.reduce((n, s) => n + s.items.length, 0);
  const hasFilter = Boolean(q || statusFilter !== 'all');

  return <section className="pm-sec pm-paper" id="course-list">
    <div className="pm-wrap">
      {filtered.map((section, si) => <div key={si}>
        <div className="pm-head-row">
          <div><p className="pm-label rule" style={{ marginBottom: 28 }}>{section.eyebrow}</p><h2 className="pm-h2">{section.title}</h2></div>
          {si === 0 ? (
            <div className="pm-stack" style={{ gap: 16 }}>
              <div className="pm-csearch" role="search" aria-label="Search and filter courses">
                <label className="pm-csearch-in">
                  <Search size={15} className="pm-csearch-ico" />
                  <input
                    type="search"
                    aria-label="Search courses"
                    placeholder="Search courses or skills…"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                  />
                  {query && (
                    <button type="button" className="pm-csearch-x" aria-label="Clear search" onClick={() => setQuery('')}>
                      <X size={13} />
                    </button>
                  )}
                </label>
                <span className="pm-csearch-div" aria-hidden="true" />
                <label className="pm-csearch-sel">
                  <select
                    aria-label="Filter courses by status"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as 'all' | 'live' | 'upcoming')}
                  >
                    <option value="all">All ({total})</option>
                    <option value="live">Live ({liveTotal})</option>
                    <option value="upcoming">Soon ({upcomingTotal})</option>
                  </select>
                  <ChevronDown size={13} aria-hidden="true" />
                </label>
              </div>
              {hasFilter && (
                <span className="pm-label" role="status">{shown} of {total} {shown === 1 ? 'course' : 'courses'}</span>
              )}
            </div>
          ) : null}
        </div>
        <div>
          {section.items.map((item, i) => {
            const id = item.slug || `course-${si}-${i}`;
            const details = item.details.filter(Boolean);
            const isVideoEditing = item.slug === 'video-editing' || /professional video editing/i.test(item.title);
            const isLive = resolveCourseStatus(item) === 'live';
            const canPay = isLive && isVideoEditing && videoEditingOffering.is_live && videoEditingOffering.enrollments_enabled;

            return <article id={id} key={id} className={'pm-spread' + (isLive ? ' is-live-course' : '')}>
              <figure className="pm-plate" data-v>
                <div className="pm-plate-img">{item.image ? <img src={item.image} alt={item.title} loading="lazy" /> : null}</div>
                <figcaption>
                  <span>Programme {String(i + 1).padStart(2, '0')}</span>
                  <span>{isLive ? 'Live · Enrolling Now' : 'Coming Soon'}</span>
                </figcaption>
              </figure>
              <div className="pm-spread-copy">
                <div className="pm-spread-status">
                  <p className="pm-label"><span className="pm-num pm-olive-text">({String(i + 1).padStart(2, '0')})</span></p>
                  {isLive ? (
                    <span className="cs-pill is-live"><i aria-hidden="true" />Live</span>
                  ) : (
                    <span className="cs-pill is-upcoming"><Clock size={11} />Coming soon</span>
                  )}
                </div>
                <h3>{item.title}</h3>
                {item.description && <p>{item.description}</p>}

                {isLive && isVideoEditing && (
                  <div className="pm-fee-bar">
                    <div>
                      <small>{videoEditingOffering.batch_label}</small>
                      <strong>{formatInr(videoEditingOffering.price_inr)}</strong>
                    </div>
                    <span>{videoEditingOffering.duration_label}</span>
                  </div>
                )}

                {details.length > 0 && <>
                  <p className="pm-label" style={{ marginTop: 10 }}>What you’ll learn</p>
                  <ul className="pm-modules" data-v>{details.map((d, j) => (
                    <li key={j} style={{ '--k': j } as React.CSSProperties}>
                      <ModuleIcon label={d} />
                      <span>{d}</span>
                    </li>
                  ))}</ul>
                </>}

                <div className="pm-row" style={{ marginTop: 8 }}>
                  {canPay ? (
                    <button type="button" className="pm-btn" onClick={() => setCheckoutOpen(true)}>
                      <CreditCard size={15} /> Enroll &amp; Pay {formatInr(videoEditingOffering.price_inr)}
                    </button>
                  ) : isLive ? (
                    <Link href={item.href || `/admissions?course=${encodeURIComponent(item.title)}`} className="pm-btn">Apply now <ArrowUpRight size={15} /></Link>
                  ) : <>
                    <span className="pm-soon-btn" aria-disabled="true"><Clock size={15} /> Coming soon</span>
                    <Link href={`/contact?type=admission&notify=1&course=${encodeURIComponent(item.title)}#enquire`} className="pm-btn ghost">Notify me <ArrowUpRight size={15} /></Link>
                  </>}
                </div>
              </div>
            </article>;
          })}
        </div>
      </div>)}
      {shown === 0 && <div className="pm-empty"><h3>No courses <em>found.</em></h3><p className="pm-small">Try a different course name, creative skill or software.</p><button type="button" className="pm-btn ink" onClick={() => { setQuery(''); setStatusFilter('all'); }}>View all courses</button></div>}
    </div>

    <VideoEditingCheckout offering={videoEditingOffering} open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
  </section>;
}
