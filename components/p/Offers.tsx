import { ArrowUpRight } from 'lucide-react';
import Link from '@/components/SiteLink';
import { offers } from '@/lib/site';

const offerImages = ['/images/academy-editing.webp', '/images/academy-studio.webp', '/images/academy-filmmaking.webp', '/images/course-cinematography.webp', '/images/course-ai-creative.webp'];

/** "What we offer" — photo bento; the photo stays put, hover only changes the text colours. */
export default function Offers() {
  return <div className="bento">
    {offers.map((o, i) => <Link key={o.title} href={o.href} className={'bento-card b' + i} data-v>
      <img src={offerImages[i % offerImages.length]} alt="" loading="lazy" decoding="async" />
      <span className="bento-shade" />
      <span className="bento-n">{String(i + 1).padStart(2, '0')}</span>
      <span className="bento-go" aria-hidden="true"><ArrowUpRight size={18} /></span>
      <div className="bento-copy"><h3>{o.title}</h3><p>{o.text}</p></div>
    </Link>)}
  </div>;
}
