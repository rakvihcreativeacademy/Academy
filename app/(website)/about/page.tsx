import type { Metadata } from 'next';
import Link from '@/components/SiteLink';
import Image from 'next/image';
import { ArrowUpRight, Eye, Target } from 'lucide-react';
import Banner from '@/components/v/Banner';
import Words from '@/components/v/Words';
import Icon from '@/components/Icon';
import { mission, whyUs, site, offers } from '@/lib/site';

export const metadata: Metadata = { title: 'About us' };

export default function About() {
  return <main className="v-page">
    <Banner crumb="About us" eyebrow="About RAKVIH Creative Academy" title="Empowering the next generation of" italic="creative professionals."
      lede={`${site.name} is an initiative of RAKVIH Digital, established to make professional creative and media skills accessible to aspiring creators.`}
      image="/images/academy-filmmaking.webp" imageAlt="Illustration of students working on a film camera" position="70% 40%"
      facts={[{ icon: 'graduation', label: '8 professional courses' }, { icon: 'mic', label: 'Premium podcast studio' }, { icon: 'film', label: 'Real production work' }]}
      side={<figure className="v-glass-quote"><blockquote>“Learn the art. Master the technology. Create your future.”</blockquote><figcaption><img src="/brand/rakvih-mark-128.png" alt="" /> RAKVIH Creative Academy</figcaption></figure>}>
      <Link href="/courses" className="v-pill-sun">Explore courses <ArrowUpRight size={15} /></Link>
      <Link href="/contact" className="v-pill-ghost">Talk to us</Link>
    </Banner>

    {/* Who we are */}
    <section className="v-sec bg-paper">
      <div className="v-wrap v-split">
        <div className="v-split-media" data-v>
          <Image src="/images/academy-editing.webp" alt="Illustration of a student editing video" fill sizes="(max-width: 900px) 92vw, 50vw" />
          <span className="v-glass-tag"><img src="/brand/rakvih-mark-128.png" alt="" />A division of RAKVIH Solutions Pvt. Ltd.</span>
        </div>
        <div className="v-head" data-v>
          <p className="v-eyebrow">Who we are</p>
          <h2><Words text="Creativity becomes a profession with the right" /> <em><Words text="knowledge, practice and technology." start={7} /></em></h2>
          <p className="v-lead">Our academy focuses on developing skills in video production, editing, cinematography, photography, filmmaking, podcasting and digital content creation.</p>
          <p className="v-lead">We aim to create an environment where students don’t just learn software and equipment, but understand how the creative industry works — through real projects, professional facilities and individual guidance.</p>
        </div>
      </div>
    </section>

    {/* What we offer */}
    <section className="v-sec bg-lime">
      <div className="v-wrap">
        <div className="v-head center" data-v><p className="v-eyebrow">What we offer</p><h2><Words text="One place to learn, create" /> <em><Words text="and grow." start={5} /></em></h2></div>
        <div className="v-tiles four">
          {offers.map((o, i) => <Link key={o.title} href={o.href} className="v-tile" data-v style={{ '--i': i } as React.CSSProperties}>
            <span className="v-tile-ico"><Icon name={o.icon} size={20} /></span><h3>{o.title}</h3><p>{o.text}</p><span className="v-tile-go"><ArrowUpRight size={16} /></span>
          </Link>)}
        </div>
      </div>
    </section>

    {/* Vision & mission */}
    <section className="v-sec bg-forest">
      <div className="v-glow-soft" aria-hidden="true" />
      <div className="v-wrap v-vm">
        <article className="v-vm-vision" data-v>
          <span className="v-tile-ico dark"><Eye size={20} /></span>
          <p className="v-eyebrow light">Our vision</p>
          <h2>To become a trusted destination for creative media education, professional production and <em>digital content innovation.</em></h2>
        </article>
        <article className="v-vm-mission" data-v>
          <span className="v-tile-ico"><Target size={20} /></span>
          <p className="v-eyebrow">Our mission</p>
          <ol>{mission.map((m, i) => <li key={m}><span>{String(i + 1).padStart(2, '0')}</span>{m}</li>)}</ol>
        </article>
      </div>
    </section>

    {/* Why choose us */}
    <section className="v-sec bg-sand">
      <div className="v-wrap">
        <div className="v-head center" data-v><p className="v-eyebrow">Why choose us</p><h2><Words text="What makes our learning" /> <em><Words text="different." start={4} /></em></h2></div>
        <div className="v-tiles five">
          {whyUs.map((w, i) => <div key={w.title} className="v-tile mini" data-v style={{ '--i': i % 5 } as React.CSSProperties}><span className="v-tile-ico"><Icon name={w.icon} size={18} /></span><h3>{w.title}</h3></div>)}
        </div>
      </div>
    </section>

    <section className="v-cta-band">
      <div className="v-wrap v-cta-inner" data-v>
        <h2>Ready to start your <em>creative journey?</em></h2>
        <div className="v-row"><Link href="/admissions" className="v-pill-sun">Apply for admission <ArrowUpRight size={15} /></Link><Link href="/courses" className="v-pill-ghost">See all courses</Link></div>
      </div>
    </section>
  </main>;
}
