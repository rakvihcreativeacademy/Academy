import Link from '@/components/SiteLink';
import Words from '@/components/v/Words';
import ViewfinderHud from '@/components/p/ViewfinderHud';

const SCENES: Record<string, string> = { About: '01', Courses: '02', 'Podcast Studio': '03', Production: '04', 'Student Work': '05', Careers: '06', Contact: '07' };

/** Each inner page opens with its own banner design (all compact, all on the dark "film" ground). */
type Variant = 'split' | 'reel' | 'onair' | 'cine' | 'mosaic' | 'compact';
const VARIANTS: Record<string, Variant> = {
  About: 'split', Courses: 'reel', 'Podcast Studio': 'onair', Production: 'cine', 'Student Work': 'mosaic', Careers: 'mosaic', Contact: 'compact',
};
const REEL = ['/images/academy-editing.webp', '/images/course-cinematography.webp', '/images/academy-photography.webp', '/images/academy-filmmaking.webp', '/images/course-motion-graphics.webp', '/images/course-lighting-sound.webp', '/images/course-content-creation.webp', '/images/course-ai-creative.webp'];
const POOL = ['/images/academy-editing.webp', '/images/course-motion-graphics.webp', '/images/academy-photography.webp', '/images/course-cinematography.webp', '/images/academy-studio.webp', '/images/course-content-creation.webp'];

type Fact = { icon?: string; label: string };

export default function Banner({ crumb, eyebrow, title, italic, lede, image, imageAlt, position = '60% 45%', facts = [], children, side }: {
  crumb: string; eyebrow: string; title: string; italic?: string; lede?: string;
  image: string; imageAlt: string; position?: string; facts?: Fact[];
  children?: React.ReactNode; side?: React.ReactNode; band?: string[];
}) {
  const v = VARIANTS[crumb] ?? 'cine';
  const n = title.split(' ').length;
  const fullBleed = v === 'onair' || v === 'cine';
  const extras = POOL.filter(p => p !== image).slice(0, 2);
  const img = <img src={image} alt={imageAlt} fetchPriority="high" decoding="async" style={{ objectPosition: position }} />;

  return <section className={`pm-banner pm-bn pm-bn--${v}`} data-hero data-dark>
    {fullBleed && <div className="pm-banner-frame">
      <div className="pm-banner-media">{img}</div>
      {v === 'cine' && <ViewfinderHud scene={SCENES[crumb] ?? '08'} />}
    </div>}
    {!fullBleed && <span className="pm-bn-ground" aria-hidden="true" />}

    <div className="pm-banner-inner">
      <div className="pm-bn-copy">
        <nav className="pm-crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><i aria-hidden="true" /><span aria-current="page">{crumb}</span></nav>
        {v === 'onair' && <span className="pm-bn-onair" aria-hidden="true"><i />On air · Studio 01</span>}
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

      {v === 'split' && <figure className="pm-bn-figure" data-v>
        {img}
        {side && <div className="pm-bn-figure-note">{side}</div>}
      </figure>}
      {v === 'mosaic' && <div className="pm-bn-mosaic" aria-hidden="true" data-v>
        <span className="a">{img}</span>
        <span className="b"><img src={extras[0]} alt="" decoding="async" /></span>
        <span className="c"><img src={extras[1]} alt="" decoding="async" /></span>
      </div>}
      {v === 'reel' && <div className="pm-bn-reel" aria-hidden="true">
        {[REEL.slice(0, 4), REEL.slice(4)].map((col, c) => <div key={c} className={'pm-bn-reel-col ' + (c ? 'down' : 'up')}>
          {[...col, ...col].map((src, k) => <span key={k}><img src={src} alt="" decoding="async" /><small>▸ {String((k % 4) + 1 + c * 4).padStart(2, '0')}</small></span>)}
        </div>)}
      </div>}
      {v === 'compact' && <div className="pm-bn-strip" data-v>{img}<span className="pm-bn-strip-tag">{SCENES[crumb] ?? '00'} · Bengaluru</span></div>}
      {v === 'cine' && side && <div className="pm-banner-side">{side}</div>}
    </div>

    {v === 'onair' && <div className="pm-bn-wave" aria-hidden="true">{Array.from({ length: 64 }, (_, k) => <i key={k} style={{ '--k': k } as React.CSSProperties} />)}</div>}
  </section>;
}
