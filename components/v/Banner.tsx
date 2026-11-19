import Link from '@/components/SiteLink';
import Words from '@/components/v/Words';
import Band from '@/components/p/Band';

type Fact = { icon?: string; label: string };

/** Cinematic opening spread for every inner page: drifting photograph, rotating seal, kinetic band underneath. */
export default function Banner({ crumb, eyebrow, title, italic, lede, image, imageAlt, position = '60% 45%', facts = [], children, side, band }: {
  crumb: string; eyebrow: string; title: string; italic?: string; lede?: string;
  image: string; imageAlt: string; position?: string; facts?: Fact[];
  children?: React.ReactNode; side?: React.ReactNode; band?: string[];
}) {
  const n = title.split(' ').length;
  return <>
    <section className="pm-banner" data-hero data-dark>
      <div className="pm-banner-media"><img src={image} alt={imageAlt} fetchPriority="high" decoding="async" style={{ objectPosition: position }} data-parallax="0.12" /></div>
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
        <div className="pm-banner-side">
          {side ?? <div className="pm-seal" aria-hidden="true">
            <svg viewBox="0 0 200 200"><defs><path id="pmSeal" d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" /></defs>
              <text><textPath href="#pmSeal">Learn the art · Master the technology · Create your future · </textPath></text></svg>
            <img src="/brand/rakvih-mark-128.png" alt="" />
          </div>}
        </div>
      </div>
    </section>
    <Band words={band ?? ['Create', 'Capture', 'Edit', 'Inspire', crumb]} />
  </>;
}
