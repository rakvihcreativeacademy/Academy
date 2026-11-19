import type { Metadata } from 'next';
import { MapPin, MessageCircle, Phone, Mail, Globe, ArrowUpRight } from 'lucide-react';
import Banner from '@/components/v/Banner';
import FormSection from '@/components/v/FormSection';
import Words from '@/components/v/Words';
import { site, whatsappLink } from '@/lib/site';

export const metadata: Metadata = { title: 'Contact us' };

export default function Contact() {
  const social = site.social.filter(s => s.href);
  const hello = whatsappLink(`Hello ${site.name}, I’d like to know more.`);
  return <main className="v-page">
    <Banner crumb="Contact" eyebrow="Contact us" title="Let’s create something" italic="extraordinary."
      lede="Interested in learning, collaborating, booking our podcast studio or hiring our production team? Connect with RAKVIH Creative Academy."
      image="/images/academy-photography.webp" imageAlt="Illustration of a photographer with a camera" position="60% 35%"
      facts={[{ icon: 'message', label: 'Fastest reply on WhatsApp' }, { icon: 'map', label: site.location }]}>
      <a href={hello} target="_blank" rel="noopener noreferrer" className="v-pill-sun"><MessageCircle size={15} /> Chat on WhatsApp</a>
      <a href="#enquire" className="v-pill-ghost">Send an enquiry</a>
    </Banner>

    <section className="v-sec bg-paper">
      <div className="v-wrap">
        <div className="v-head center" data-v><p className="v-eyebrow">Get in touch</p><h2><Words text="Real people," /> <em><Words text="ready to help." start={2} /></em></h2></div>
        <div className="v-contact-grid">
          <a className="v-contact wa" href={hello} target="_blank" rel="noopener noreferrer" data-v><span className="v-tile-ico"><MessageCircle size={20} /></span><small>WhatsApp · fastest</small><b>{site.whatsappDisplay}</b><ArrowUpRight size={16} className="go" /></a>
          <a className="v-contact" href={`tel:+${site.whatsapp}`} data-v><span className="v-tile-ico"><Phone size={20} /></span><small>Call us</small><b>{site.whatsappDisplay}</b><ArrowUpRight size={16} className="go" /></a>
          {site.email && <a className="v-contact" href={`mailto:${site.email}`} data-v><span className="v-tile-ico"><Mail size={20} /></span><small>Email</small><b>{site.email}</b><ArrowUpRight size={16} className="go" /></a>}
          <div className="v-contact" data-v><span className="v-tile-ico"><MapPin size={20} /></span><small>Location</small><b>{site.location}</b></div>
          {site.website && <div className="v-contact" data-v><span className="v-tile-ico"><Globe size={20} /></span><small>Website</small><b>{site.website}</b></div>}
          <div className="v-contact org" data-v><img src="/brand/rakvih-mark-128.png" alt="" /><small>{site.name}</small><b>A Division of RAKVIH Digital · RAKVIH Solutions Pvt. Ltd.</b>
            {social.length > 0 && <span className="v-social">{social.map(s => <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>)}</span>}</div>
        </div>
      </div>
    </section>

    <FormSection tone="sand" eyebrow="Send an enquiry" title="Tell us how we" italic="can help."
      sub="Pick a topic — course admission, studio booking, production or a general question — and your message opens in WhatsApp, ready to send." type="general" allowTypeSwitch />
  </main>;
}
