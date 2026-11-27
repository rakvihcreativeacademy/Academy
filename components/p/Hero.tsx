'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Award, Calendar, Users } from 'lucide-react';
import Link from '@/components/SiteLink';
import { site } from '@/lib/site';
import { bannerImages } from '@/lib/banner-images';

const plates = bannerImages.map((image, index) => index === 0 ? { src: '/images/banners/home-editing-first-v2.webp', alt: 'Professional editor cutting a film in a cinematic editing studio' } : image);
const HOLD = 5600;

/**
 * Simple full-bleed homepage banner with slow zooming photography plates,
 * editorial headline, and primary calls to action.
 */
export default function Hero() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setTimeout(() => setI(n => (n + 1) % plates.length), HOLD);
    return () => clearTimeout(t);
  }, [i]);

  return <section className="pm-hero-simple" data-hero data-dark>
    <div className="pm-hero-simple-media" aria-hidden="true">
      {plates.map((p, n) => (
        <img
          key={p.src}
          src={p.src}
          alt={n === i ? p.alt : ''}
          className={n === i ? 'on' : ''}
          fetchPriority={n === 0 ? 'high' : 'low'}
          decoding="async"
        />
      ))}
      <span className="pm-hero-simple-shade" />
    </div>

    <div className="pm-wrap pm-hero-simple-inner">
      <div className="pm-hero-simple-top" aria-hidden="true">
        <span>Editing · Cinema · Photo · Design</span>
      </div>

      <div className="pm-hero-simple-bottom">
        <div>
          <p className="pm-label on-dark"><span className="pm-dot" /> Admissions open — {site.location.split(',')[0]}</p>
          <h1 className="pm-hx-title">Turn your creativity <em>into your career.</em></h1>
        </div>
        <div className="pm-hx-side">
          <p className="pm-hero-blurb">Hands-on 45-day training in editing, cinema &amp; photography with live project training &amp; trainer assistance.</p>
          <ul className="pm-hero-badges" aria-label="Training highlights">
            <li><Calendar size={12} /> 45-Day Training Program</li>
            <li><Users size={12} /> Live Project Training with Trainer Assistance</li>
            <li><Award size={12} /> Get Training Certificate in 45 Days</li>
          </ul>
          <div className="pm-row on-dark">
            <Link href="/courses" className="pm-btn">Explore Our Courses <ArrowUpRight size={15} /></Link>
            <Link href="/podcast-studio#enquire" className="pm-btn ghost on-dark">Book Our Podcast Studio</Link>
          </div>
        </div>
      </div>

      <div className="pm-hero-simple-dots" role="tablist" aria-label="Hero showcase images">
        {plates.map((p, n) => (
          <button
            key={p.src}
            type="button"
            role="tab"
            aria-selected={n === i}
            aria-label={`Show slide ${n + 1}`}
            className={n === i ? 'on' : ''}
            onClick={() => setI(n)}
          />
        ))}
      </div>
    </div>
  </section>;
}
