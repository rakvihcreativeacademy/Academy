import type { Metadata } from 'next';
import Link from '@/components/SiteLink';
import { ArrowUpRight } from 'lucide-react';
import Banner from '@/components/v/Banner';
import Words from '@/components/v/Words';
import { mission, whyUs, site } from '@/lib/site';
import Offers from '@/components/p/Offers';

export const metadata: Metadata = { title: 'About us' };

export default function About() {
  return <main className="pm-page">
    <Banner crumb="About" eyebrow="About RAKVIH Digital" title="Empowering the next generation of" italic="creative professionals."
      lede={`${site.name} is a division of RAKVIH Solutions Pvt. Ltd., built around technology, creativity and practical learning — established to make professional creative and media skills accessible to aspiring creators, while offering production facilities and services to businesses and individuals.`}
      image="/images/academy-filmmaking.webp" imageAlt="Illustration of students working on a film camera" position="70% 40%"
      facts={[{ label: '8 professional courses' }, { label: 'Premium podcast studio' }, { label: 'Real production work' }]}
      side={<figure className="pm-quote"><blockquote>“Learn the art. Master the technology. Create your future.”</blockquote><figcaption><img src="/brand/rakvih-mark-128.png" alt="" /> RAKVIH Digital</figcaption></figure>}>
      <Link href="/courses" className="pm-btn">Explore courses <ArrowUpRight size={15} /></Link>
      <Link href="/contact" className="pm-btn ghost on-dark">Talk to us</Link>
    </Banner>

    <section className="pm-sec pm-paper">
      <div className="pm-wrap pm-split">
        <figure className="pm-plate" data-v>
          <div className="pm-plate-img"><img src="/images/academy-editing.webp" alt="Illustration of a student editing video" loading="lazy" data-parallax="0.05" /></div>
          <figcaption><span>Plate 01 — The edit suite</span><span>RAKVIH Solutions Pvt. Ltd.</span></figcaption>
        </figure>
        <div className="pm-stack">
          <div data-v>
            <p className="pm-label rule" style={{ marginBottom: 28 }}>(01) — <b>Who we are</b></p>
            <h2 className="pm-h2" style={{ fontSize: 'clamp(30px,3.4vw,54px)' }}><Words text="We believe creativity becomes a profession when it is supported by the right" /> <em><Words text="knowledge, practical experience and technology." start={14} /></em></h2>
          </div>
          <p className="pm-lede">Our academy focuses on developing skills in video production, editing, cinematography, photography, filmmaking, podcasting and digital content creation.</p>
          <p className="pm-lede">We aim to create an environment where students don’t just learn software and equipment, but understand how the creative industry works.</p>
        </div>
      </div>
    </section>

    <section className="pm-sec pm-paper2">
      <div className="pm-wrap">
        <div className="pm-head-row">
          <div data-v><p className="pm-label rule">(02) — <b>What we offer</b></p><h2 className="pm-h2"><Words text="One place to learn," /> <em><Words text="create and grow." start={4} /></em></h2></div>
          <p className="pm-lede">Training, a professional studio, real production work, creative services and technology — under one brand.</p>
        </div>
        <Offers />
      </div>
    </section>

    <section className="pm-sec pm-dark" data-dark>
      <div className="pm-wrap pm-vm">
        <div className="pm-stack" data-v>
          <p className="pm-label rule">(03) — <b>Our vision</b></p>
          <h2 className="pm-h2" style={{ fontSize: 'clamp(34px,3.8vw,60px)' }}>To become a trusted destination for creative media education, professional production and <em>digital content innovation.</em></h2>
        </div>
        <div className="pm-stack">
          <p className="pm-label rule">Our mission</p>
          <ol>{mission.map((m, i) => <li key={m}><span>{String(i + 1).padStart(2, '0')}</span>{m}</li>)}</ol>
        </div>
      </div>
    </section>

    <section className="pm-sec pm-paper">
      <div className="pm-wrap">
        <div className="pm-head-row">
          <div data-v><p className="pm-label rule">(04) — <b>Why choose RAKVIH Digital?</b></p><h2 className="pm-h2"><Words text="What makes our learning" /> <em><Words text="different." start={4} /></em></h2></div>
          <p className="pm-lede">Ten reasons students choose to learn with us.</p>
        </div>
        <div className="pm-grid" style={{ '--cols': 5 } as React.CSSProperties}>
          {whyUs.map((w, i) => <div key={w.title} className="pm-cell" data-v style={{ '--d': `${(i % 5) * 70}ms`, minHeight: 190 } as React.CSSProperties}>
            <span className="n pm-num">{String(i + 1).padStart(2, '0')}</span><h3 style={{ marginTop: 'auto', fontSize: 22 }}>{w.title}</h3>
          </div>)}
        </div>
      </div>
    </section>

    <section className="pm-sec pm-dark2" data-dark>
      <div className="pm-wrap pm-cta-band" data-v>
        <p className="pm-label on-dark"><span className="pm-dot" /> Admissions open</p>
        <h2 className="pm-h2">Ready to start your <em>creative journey?</em></h2>
        <div className="pm-row on-dark"><Link href="/admissions" className="pm-btn">Apply for admission <ArrowUpRight size={15} /></Link><Link href="/courses" className="pm-btn ghost on-dark">See all courses</Link></div>
      </div>
    </section>
  </main>;
}
