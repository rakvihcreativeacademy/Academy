import Link from '@/components/SiteLink';
import { ChevronRight } from 'lucide-react';

/** Banner used at the top of every inner page. */
export default function PageHero({ eyebrow, title, lede, crumb, children }: { eyebrow: string; title: React.ReactNode; lede?: string; crumb: string; children?: React.ReactNode }) {
  return <section className="page-hero">
    <div className="page-hero-inner">
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><ChevronRight size={14} /><span>{crumb}</span></nav>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {lede && <p className="page-hero-lede">{lede}</p>}
      {children && <div className="page-hero-actions">{children}</div>}
    </div>
    <div className="page-hero-art" aria-hidden="true"><span /><span /><span /></div>
  </section>;
}
