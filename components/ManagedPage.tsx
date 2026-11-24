import Link from '@/components/SiteLink';
import { ArrowUpRight, Mic } from 'lucide-react';
import Banner from '@/components/v/Banner';
import FormSection from '@/components/v/FormSection';
import CourseListing from '@/components/CourseListing';
import BrandCard from '@/components/BrandCard';
import { getPageContent } from '@/lib/cms/server';
import { getVideoEditingOffering } from '@/lib/payments-server';
import type { PageKey } from '@/lib/cms/schema';
import { configured } from '@/lib/supabase/config';
import { createPublicClient } from '@/lib/supabase/public';
import type { Project } from '@/lib/types';
import { itemImages } from '@/lib/item-images';
import ChapterNav, { type Chapter } from '@/components/p/ChapterNav';
import ShootEdit from '@/components/p/ShootEdit';

const labels = { courses: 'Courses', 'podcast-studio': 'Podcast Studio', production: 'Production', projects: 'Student Work', careers: 'Careers' };
const tones = ['pm-paper', 'pm-dark', 'pm-paper2'];
/** Pages with their own card design + hover motion (everything else uses the shared photo tile). */
const cardVariants: Partial<Record<PageKey, 'st' | 'cr'>> = { 'podcast-studio': 'st', careers: 'cr' };

/** CMS-driven inner page rendered as numbered editorial chapters. Content comes from the admin workspace. */
export default async function ManagedPage({ page }: { page: PageKey }) {
  const doc = await getPageContent(page);
  const courseDoc = page === 'courses' ? doc : await getPageContent('courses');
  const videoEditingOffering = page === 'courses' ? await getVideoEditingOffering() : undefined;
  const courseOptions = courseDoc.sections.flatMap(s => s.items.map(i => i.title));
  let projects: Project[] = [];
  if (page === 'projects' && configured) {
    try {
      const db = createPublicClient();
      const { data } = await db.from('projects').select('*').eq('status', 'published').order('created_at', { ascending: false });
      projects = data ?? [];
    } catch {
      projects = [];
    }
  }
  const b = doc.banner;
  const variant = cardVariants[page];
  const short = (t: string) => t.replace(/^Professional\s+/i, '').replace(/\s*&\s*/g, ' & ');
  const chapters: Chapter[] = page === 'courses'
    ? doc.sections.flatMap((s, si) => s.items.map((it, i) => ({ id: it.slug || `course-${si}-${i}`, label: short(it.title) })))
    : [
      ...doc.sections.map((s, si) => ({ id: `ch-${si + 1}`, label: s.eyebrow || s.title })),
      ...(page === 'projects' ? [{ id: 'showcase', label: 'Student showcase' }] : []),
      ...(doc.enquiry.enabled ? [{ id: 'enquire', label: page === 'podcast-studio' ? 'Book the studio' : page === 'production' ? 'Start a project' : 'Enquire' }] : []),
    ];
  return <main className="pm-page managed-page">
    <Banner crumb={labels[page]} eyebrow={b.eyebrow} title={b.title} italic={b.italic} lede={b.description} image={b.image || '/images/academy-filmmaking.webp'} imageAlt={b.image_alt} band={doc.sections[0]?.items.map(i => i.title)}>
      {b.button_label && b.button_link && <Link className="pm-btn" href={b.button_link}>{b.button_label}<ArrowUpRight size={15} /></Link>}
      {page === 'podcast-studio' && <Link className="pm-btn ghost on-dark" href="/admissions?type=studio#apply">Enquire About Packages</Link>}
    </Banner>

    <ChapterNav items={chapters} title={page === 'courses' ? 'Programmes' : labels[page]} />
    {page === 'production' && <ShootEdit label="On set" variant="production" />}

    {page === 'courses' ? <CourseListing sections={doc.sections} videoEditingOffering={videoEditingOffering} /> : doc.sections.map((section, si) => {
      const tone = tones[si % tones.length];
      const dark = tone === 'pm-dark';
      const withMedia = section.items.some(i => i.image);
      const n = section.items.length;
      const bgs = withMedia ? [] : itemImages(section.items.map(it => it.title));
      // Podcast bento: a 2×2 feature tile, then singles; the last tile widens to close the final row.
      const stFill4 = 1 + ((4 - ((n + 3) % 4)) % 4);
      const stOdd2 = (n - 1) % 2 === 1;
      const variantImgs = withMedia ? itemImages(section.items.map(it => it.title)) : bgs;
      const cols = n <= 4 ? Math.max(n, 1) : [4, 5, 3].find(c => n % c === 0) ?? 4;
      return <section className={`pm-sec ${tone}`} key={si} id={`ch-${si + 1}`} data-dark={dark || undefined}>
        <div className="pm-wrap">
          <div className="pm-head-row">
            <div data-v>
              <p className="pm-label rule" style={{ marginBottom: 20 }}>({String(si + 1).padStart(2, '0')}) — <b>{section.eyebrow}</b></p>
              <h2 className="pm-h2">{section.title}</h2>
            </div>
            {section.description ? <p className="pm-lede">{section.description}</p> : <span />}
          </div>
          {variant ? <div className={`${variant}-grid` + (variant === 'st' && n >= 6 ? ' st-bento' : '')} style={{ '--cols': cols } as React.CSSProperties}>
            {section.items.map((item, i) => {
              const img = item.image || variantImgs[i];
              const num = String(i + 1).padStart(2, '0');
              const details = item.details.filter(Boolean);
              const bento = variant === 'st' && n >= 6;
              const hero = bento && i === 0;
              const body = variant === 'st' ? <>
                <span className="st-media" aria-hidden="true"><img src={img} alt="" loading="lazy" decoding="async" /></span>
                <span className="st-glow" aria-hidden="true" />
                <span className="st-top">
                  <span className="st-onair"><i />{hero ? 'Live studio' : 'On air'}</span>
                  <span className="st-n">{num}<small>/{String(n).padStart(2, '0')}</small></span>
                </span>
                <span className="st-panel">
                  <span className="st-mic" aria-hidden="true"><Mic size={hero ? 20 : 16} strokeWidth={1.8} /></span>
                  <span className="st-copy">
                    <h3>{item.title}</h3>
                    {(item.description || details.length > 0) && <span className="st-more"><span>
                      {item.description && <p>{item.description}</p>}
                      {details.length > 0 && <ul>{details.map((d, j) => <li key={j}>{d}</li>)}</ul>}
                    </span></span>}
                  </span>
                  <span className="st-eq" aria-hidden="true">{Array.from({ length: hero ? 14 : 9 }, (_, k) => <i key={k} style={{ '--k': k } as React.CSSProperties} />)}</span>
                </span>
              </> : <>
                <span className="cr-n" aria-hidden="true">{num}</span>
                <span className="cr-media" aria-hidden="true"><img src={img} alt="" loading="lazy" decoding="async" /></span>
                <span className="cr-body">
                  <span className="cr-step">Path {num}</span>
                  <h3>{item.title}</h3>
                  {item.description && <p>{item.description}</p>}
                  {details.length > 0 && <ul>{details.map((d, j) => <li key={j}>{d}</li>)}</ul>}
                </span>
                <span className="cr-go" aria-hidden="true"><ArrowUpRight size={16} /></span>
                <span className="cr-line" aria-hidden="true" />
              </>;
              const props = { id: item.slug || undefined, className: `${variant}-card` + (hero ? ' st-hero' : '') + (bento && i === n - 1 ? ` st-last-${stFill4}` + (stOdd2 ? ' st-last2' : '') : ''), 'data-v': '', style: { '--d': `${(i % 4) * 80}ms` } as React.CSSProperties };
              return item.href ? <Link key={i} href={item.href} {...props}>{body}</Link> : <article key={i} {...props}>{body}</article>;
            })}
          </div> : <div className="pm-grid" style={{ '--cols': cols } as React.CSSProperties}>
            {section.items.map((item, i) => {
              const bg = withMedia ? '' : bgs[i];
              const cls = 'pm-cell' + (bg ? ` has-bg fx-${(i + si * 3) % 7}` : '');
              const body = <>
                {bg && <span className="pm-cell-bg" aria-hidden="true"><img src={bg} alt="" loading="lazy" decoding="async" /></span>}
                {withMedia && item.image && <img className="cover" src={item.image} alt={item.title} loading="lazy" />}
                <span className="n pm-num">{String(i + 1).padStart(2, '0')}</span>
                <h3 style={{ marginTop: withMedia ? 0 : 36 }}>{item.title}</h3>
                {item.description && <p>{item.description}</p>}
                {item.details.filter(Boolean).length > 0 && <ul>{item.details.filter(Boolean).map((d, j) => <li key={j}>{d}</li>)}</ul>}
              </>;
              return item.href
                ? <Link key={i} id={item.slug || undefined} href={item.href} className={cls} data-v style={{ '--d': `${(i % 4) * 70}ms` } as React.CSSProperties}>{body}<ArrowUpRight size={18} className="arrow" /></Link>
                : <article key={i} id={item.slug || undefined} className={cls} data-v style={{ '--d': `${(i % 4) * 70}ms` } as React.CSSProperties}>{body}</article>;
            })}
          </div>}
        </div>
      </section>;
    })}

    {page === 'projects' && <section className="pm-sec pm-paper" id="showcase">
      <div className="pm-wrap">
        <div className="pm-head-row"><div><p className="pm-label rule" style={{ marginBottom: 28 }}>Student showcase</p><h2 className="pm-h2">Work by <em>our students.</em></h2></div><span /></div>
        {projects.length
          ? <div className="project-grid">{projects.map(p => <Link key={p.id} href={'/projects/' + p.id}><BrandCard project={p} /></Link>)}</div>
          : <div className="pm-empty"><p className="pm-label">Darkroom</p><h3>Student work is <em>developing.</em></h3><p className="pm-small">Approved, published student projects will appear here.</p></div>}
      </div>
    </section>}

    {doc.enquiry.enabled && <FormSection eyebrow="Get in touch" title={doc.enquiry.title} sub={doc.enquiry.description}
      courseOptions={courseOptions} type={page === 'podcast-studio' ? 'studio' : page === 'production' ? 'production' : 'admission'} />}
  </main>;
}
