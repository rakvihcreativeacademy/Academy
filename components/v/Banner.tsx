import Image from 'next/image';
import Link from '@/components/SiteLink';
import { ChevronRight } from 'lucide-react';
import Words from '@/components/v/Words';
import Icon from '@/components/Icon';

type Fact = { icon: string; label: string };

/** Cinematic banner used at the top of every inner page (same language as the home hero). */
export default function Banner({ crumb, eyebrow, title, italic, lede, image, imageAlt, position = '60% 45%', facts = [], children, side }: {
  crumb: string; eyebrow: string; title: string; italic?: string; lede?: string;
  image: string; imageAlt: string; position?: string; facts?: Fact[];
  children?: React.ReactNode; side?: React.ReactNode;
}) {
  const n = title.split(' ').length;
  return <section className="v-hb v-banner">
    <div className="v-hb-media"><Image unoptimized src={image} alt={imageAlt} fill priority sizes="100vw" className="on" style={{ objectPosition: position }} /></div>
    <div className="v-hb-shade" aria-hidden="true" />
    <div className="v-hb-grain" aria-hidden="true" />
    <div className="v-hb-inner">
      <div className="v-hb-copy" data-v>
        <nav className="v-crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><ChevronRight size={13} /><span>{crumb}</span></nav>
        <p className="v-hb-badge"><span />{eyebrow}</p>
        <h1><Words text={title} />{italic && <><br /><em><Words text={italic} start={n} /></em></>}</h1>
        {lede && <p className="v-hb-lede">{lede}</p>}
        {children && <div className="v-row v-banner-actions">{children}</div>}
        {facts.length > 0 && <ul className="v-hb-facts">{facts.map(f => <li key={f.label}><Icon name={f.icon} size={16} />{f.label}</li>)}</ul>}
      </div>
      {side && <div className="v-banner-side">{side}</div>}
    </div>
  </section>;
}
