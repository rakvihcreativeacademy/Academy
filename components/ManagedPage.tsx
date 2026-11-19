import Link from '@/components/SiteLink';
import { ArrowUpRight } from 'lucide-react';
import Banner from '@/components/v/Banner';
import FormSection from '@/components/v/FormSection';
import CourseListing from '@/components/CourseListing';
import BrandCard from '@/components/BrandCard';
import { getPageContent } from '@/lib/cms/server';
import type { PageKey } from '@/lib/cms/schema';
import { configured } from '@/lib/supabase/config';
import { createPublicClient } from '@/lib/supabase/public';
import type { Project } from '@/lib/types';
import { itemImages } from '@/lib/item-images';

const labels = { courses: 'Courses', 'podcast-studio': 'Podcast Studio', production: 'Production', projects: 'Student Work', careers: 'Careers' };
const tones = ['pm-paper', 'pm-dark', 'pm-paper2'];

/** CMS-driven inner page rendered as numbered editorial chapters. Content comes from the admin workspace. */
export default async function ManagedPage({ page }: { page: PageKey }) {
  const doc = await getPageContent(page);
  const courseDoc = page === 'courses' ? doc : await getPageContent('courses');
  const courseOptions = courseDoc.sections.flatMap(s => s.items.map(i => i.title));
  let projects: Project[] = [];
  if (page === 'projects' && configured) {
    const db = createPublicClient();
    const { data, error } = await db.from('projects').select('*').eq('status', 'published').order('created_at', { ascending: false });
    if (error) throw new Error('Unable to load student work.');
    projects = data ?? [];
  }
  const b = doc.banner;
  return <main className="pm-page managed-page">
    <Banner crumb={labels[page]} eyebrow={b.eyebrow} title={b.title} italic={b.italic} lede={b.description} image={b.image || '/images/academy-filmmaking.webp'} imageAlt={b.image_alt} band={doc.sections[0]?.items.map(i => i.title)}>
      {b.button_label && b.button_link && <Link className="pm-btn" href={b.button_link}>{b.button_label}<ArrowUpRight size={15} /></Link>}
      {page === 'podcast-studio' && <Link className="pm-btn ghost on-dark" href="/admissions?type=studio#apply">Enquire About Packages</Link>}
    </Banner>

    {page === 'courses' ? <CourseListing sections={doc.sections} /> : doc.sections.map((section, si) => {
      const tone = tones[si % tones.length];
      const dark = tone === 'pm-dark';
      const withMedia = section.items.some(i => i.image);
      const n = section.items.length;
      const bgs = withMedia ? [] : itemImages(section.items.map(it => it.title));
      const cols = n <= 4 ? Math.max(n, 1) : [4, 5, 3].find(c => n % c === 0) ?? 4;
      return <section className={`pm-sec ${tone}`} key={si} data-dark={dark || undefined}>
        <div className="pm-wrap">
          <div className="pm-head-row">
            <div data-v>
              <p className="pm-label rule" style={{ marginBottom: 20 }}>({String(si + 1).padStart(2, '0')}) — <b>{section.eyebrow}</b></p>
              <h2 className="pm-h2" style={{ fontSize: 'clamp(36px,4.6vw,76px)' }}>{section.title}</h2>
            </div>
            {section.description ? <p className="pm-lede">{section.description}</p> : <span />}
          </div>
          <div className="pm-grid" style={{ '--cols': cols } as React.CSSProperties}>
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
          </div>
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
