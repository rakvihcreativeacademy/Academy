import type { Metadata } from 'next';
import Link from '@/components/SiteLink';
import { ArrowUpRight } from 'lucide-react';
import NeonHero from '@/components/p/NeonHero';
import Words from '@/components/v/Words';
import { mission, site } from '@/lib/site';

export const metadata: Metadata = { title: 'About us' };

export default function About() {
  return <main className="pm-page">
    <NeonHero
      word="About"
      pill="About RAKVIH Digital"
      title="Empowering the next generation of"
      italic="creative professionals."
      lede={`${site.name} is a division of RAKVIH Solutions Pvt. Ltd., built around technology, creativity and practical learning, making professional creative and media skills accessible to aspiring creators.`}
      image="/images/banners/creative-suite-devices.jpg"
    >
      <Link href="/contact" className="pm-btn">Talk to us <ArrowUpRight size={15} /></Link>
    </NeonHero>

    <section className="pm-sec pm-paper">
      <div className="pm-wrap pm-split">
        <figure className="pm-plate" data-v>
          <div className="pm-plate-img"><img src="/images/banners/editing-colour.webp" alt="Colourist grading a film using a professional control panel" loading="lazy" data-parallax="0.05" /></div>
          <figcaption><span>Plate 01 — The edit suite </span><span>RAKVIH Solutions Pvt. Ltd.</span></figcaption>
        </figure>
        <div className="pm-stack">
          <div data-v>
            <p className="pm-label rule" style={{ marginBottom: 28 }}>(01) — <b>Who we are</b></p>
            <h2 className="pm-h2" style={{ fontSize: 'clamp(30px,3.4vw,54px)' }}><Words text="We believe creativity becomes a profession when it is supported by the right" /> <em><Words text="knowledge, practical experience and technology." start={14} /></em></h2>
          </div>
          <p className="pm-lede">{site.name} is a division of RAKVIH Solutions Pvt. Ltd., based in {site.location}. We bring creative education, a premium podcast studio, media production and digital technology together under one brand.</p>
          <p className="pm-lede">Our aim is simple: give creators, businesses and individuals a place where ideas are supported by the right people, facilities and technology.</p>
        </div>
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

    <section className="pm-sec pm-dark2" data-dark>
      <div className="pm-wrap pm-cta-band" data-v>
        <p className="pm-label on-dark"><span className="pm-dot" /> Get in touch</p>
        <h2 className="pm-h2">Let&rsquo;s create something <em>together.</em></h2>
        <div className="pm-row on-dark"><Link href="/contact" className="pm-btn">Contact us <ArrowUpRight size={15} /></Link></div>
      </div>
    </section>
  </main>;
}
