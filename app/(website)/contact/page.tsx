import type { Metadata } from 'next';
import { MessageCircle, ArrowUpRight, Instagram, Facebook, Youtube, Linkedin } from 'lucide-react';
import Banner from '@/components/v/Banner';
import FormSection from '@/components/v/FormSection';
import Words from '@/components/v/Words';
import { site, whatsappLink } from '@/lib/site';

export const metadata: Metadata = { title: 'Contact us' };

const socialIcons: Record<string, React.ReactNode> = {
  Instagram: <Instagram size={15} />,
  Facebook: <Facebook size={15} />,
  YouTube: <Youtube size={15} />,
  LinkedIn: <Linkedin size={15} />,
};

export default function Contact() {
  const social = site.social.filter(s => s.href);
  const hello = whatsappLink(`Hello ${site.name}, I'd like to know more.`);
  return <main className="pm-page">
    <Banner crumb="Contact" eyebrow="Contact us" title="Let's create something" italic="extraordinary."
      lede="Interested in learning, collaborating, booking our podcast studio or hiring our production team? Connect with RAKVIH Digital."
      image="/images/academy-photography.webp" imageAlt="Illustration of a photographer with a camera" position="60% 35%"
      facts={[{ label: 'Fastest reply on WhatsApp' }, { label: site.location }]}>
      <a href={hello} target="_blank" rel="noopener noreferrer" className="pm-btn"><MessageCircle size={15} /> Chat on WhatsApp</a>
      <a href="#enquire" className="pm-btn ghost on-dark">Send an enquiry</a>
    </Banner>

    <section className="pm-sec pm-paper">
      <div className="pm-wrap">
        <div className="pm-head-row">
          <div data-v><p className="pm-label rule">(01) — <b>Get in touch</b></p><h2 className="pm-h2"><Words text="Real people," /> <em><Words text="ready to help." start={2} /></em></h2></div>
          <p className="pm-lede">WhatsApp is the fastest way to reach our team — for courses, studio bookings and production enquiries.</p>
        </div>
        <div className="pm-contacts">
          <a href={hello} target="_blank" rel="noopener noreferrer" data-v><small>WhatsApp · fastest</small><b>{site.whatsappDisplay}</b><ArrowUpRight size={18} className="arrow" /></a>
          <a href={`tel:+${site.whatsapp}`} data-v><small>Call us</small><b>{site.whatsappDisplay}</b><ArrowUpRight size={18} className="arrow" /></a>
          {site.email && <a href={`mailto:${site.email}`} data-v><small>Email</small><b>{site.email}</b><ArrowUpRight size={18} className="arrow" /></a>}
          <div data-v><small>Studio</small><b>{site.location}</b></div>
          {site.website && <div data-v><small>Website</small><b>{site.website}</b></div>}
          <div data-v><small>{site.name}</small><b style={{ fontSize: 20 }}>{site.parent}</b>
            {social.length > 0 && <span className="pm-row" style={{ marginTop: 10 }}>{social.map(s => <a key={s.label} className="pm-link" href={s.href} target="_blank" rel="noopener noreferrer">{socialIcons[s.label]} {s.label}</a>)}</span>}</div>
        </div>
      </div>
    </section>

    <FormSection eyebrow="Send an enquiry" title="Tell us how we" italic="can help."
      sub="Pick a topic — course admission, studio booking, production or a general question — and your message opens in WhatsApp, ready to send." type="general" allowTypeSwitch />
  </main>;
}
