import Link from '@/components/SiteLink';
import Words from '@/components/v/Words';
import Band from '@/components/p/Band';
import ViewfinderHud from '@/components/p/ViewfinderHud';

const SCENES: Record<string, string> = { About: '01', Courses: '02', 'Podcast Studio': '03', Production: '04', 'Student Work': '05', Careers: '06', Contact: '07' };

type Fact = { icon?: string; label: string };

/** Cinematic opening for every inner page: a photograph seen through a camera viewfinder (REC, timecode, focus box), pulling back as you scroll; kinetic band underneath. */
export default function Banner({ crumb, eyebrow, title, italic, lede, image, imageAlt, position = '60% 45%', facts = [], children, side, band }: {
  crumb: string; eyebrow: string; title: string; italic?: string; lede?: string;
  image: string; imageAlt: string; position?: string; facts?: Fact[];
  children?: React.ReactNode; side?: React.ReactNode; band?: string[];
}) {
  const n = title.split(' ').length;
  return <>
    <section className="pm-banner" data-hero data-dark>
      <div className="pm-banner-frame">
        <div className="pm-banner-media"><img src={image} alt={imageAlt} fetchPriority="high" decoding="async" style={{ objectPosition: position }} /></div>
        <ViewfinderHud scene={SCENES[crumb] ?? '08'} />
      </div>
      <div className="pm-banner-inner">
        <div>
          <nav className="pm-crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><i aria-hidden="true" /><span aria-current="page">{crumb}</span></nav>
          <div data-v>
            <h1 className="pm-h1"><Words text={title} />{italic && <> <em><Words text={italic} start={n} /></em></>}</h1>
          </div>
          <div className="pm-banner-copy" data-v>
            <p className="pm-label on-dark"><span className="pm-dot" /> {eyebrow}</p>
            {lede && <p className="pm-lede">{lede}</p>}
            {children && <div className="pm-row on-dark">{children}</div>}
            {facts.length > 0 && <ul className="pm-facts">{facts.map(f => <li key={f.label}>{f.label}</li>)}</ul>}
          </div>
        </div>
        {side && <div className="pm-banner-side">{side}</div>}
      </div>
    </section>
    <Band words={band ?? ['Create', 'Capture', 'Edit', 'Inspire', crumb]} />
  </>;
}
