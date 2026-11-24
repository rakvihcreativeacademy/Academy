import type { Metadata } from 'next';
import { Phone, ArrowUpRight, Instagram, Facebook, Youtube, Linkedin, MessageCircle, Mail, MapPin, GraduationCap, Mic, Clapperboard } from 'lucide-react';
import Banner from '@/components/v/Banner';
import FormSection from '@/components/v/FormSection';
import Words from '@/components/v/Words';
import { site, whatsappLink } from '@/lib/site';
import { getPageContent } from '@/lib/cms/server';
import { isCourseEnabled } from '@/lib/cms/schema';

export const metadata: Metadata = { title: 'Contact us' };

const socialIcons: Record<string, React.ReactNode> = {
  Instagram: <Instagram size={15} />,
  Facebook: <Facebook size={15} />,
  YouTube: <Youtube size={15} />,
  LinkedIn: <Linkedin size={15} />,
};

export default async function Contact() {
  const social = site.social.filter(s => s.href);
  const courseDoc = await getPageContent('courses');
  const courseOptions = courseDoc.sections.flatMap(sec => sec.items.filter(it => isCourseEnabled(it)).map(it => it.title));
  return <main className="pm-page pm-contact">
    <Banner crumb="Contact" eyebrow="Contact us" title="Let's create something" italic="extraordinary."
      lede="Interested in learning, collaborating, booking our podcast studio or hiring our production team? Connect with RAKVIH Digital."
      image="/images/academy-photography.webp" imageAlt="Illustration of a photographer with a camera" position="60% 35%"
      facts={[{ label: 'Direct response from our team' }, { label: site.location }]}>
      <a href="#enquire" className="pm-btn">Send an enquiry <ArrowUpRight size={15} /></a>
      <a href={`tel:+${site.whatsapp}`} className="pm-btn ghost on-dark"><Phone size={15} /> Call {site.whatsappDisplay}</a>
    </Banner>

    <section className="pm-sec pm-paper ct-sec">
      <div className="pm-wrap">
        <div className="pm-head-row">
          <div data-v><p className="pm-label rule">(01) — <b>Get in touch</b></p><h2 className="pm-h2"><Words text="Real people," /> <em><Words text="ready to help." start={2} /></em></h2></div>
        </div>
        <div className="ct-grid">
          <a className="ct-card ct-wa" href={whatsappLink(`Hello ${site.name}, I’d like to know more.`)} target="_blank" rel="noopener noreferrer" data-v>
            <span className="ct-ico"><MessageCircle size={20} /></span>
            <span className="ct-k">Fastest reply · WhatsApp</span>
            <b className="ct-big">{site.whatsappDisplay}</b>
            <span className="ct-p">Message us any time — admissions, studio bookings or a production brief. Our team replies directly.</span>
            <span className="ct-cta">Chat on WhatsApp <ArrowUpRight size={16} /></span>
          </a>
          <a className="ct-card" href={`tel:+${site.whatsapp}`} data-v>
            <span className="ct-ico"><Phone size={18} /></span>
            <span className="ct-k">Call us</span>
            <b>{site.whatsappDisplay}</b>
            <span className="ct-go"><ArrowUpRight size={16} /></span>
          </a>
          {site.email
            ? <a className="ct-card" href={`mailto:${site.email}`} data-v><span className="ct-ico"><Mail size={18} /></span><span className="ct-k">Email</span><b>{site.email}</b><span className="ct-go"><ArrowUpRight size={16} /></span></a>
            : <a className="ct-card" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.name + ' ' + site.location)}`} target="_blank" rel="noopener noreferrer" data-v><span className="ct-ico"><MapPin size={18} /></span><span className="ct-k">Visit the studio</span><b>{site.location}</b><span className="ct-go"><ArrowUpRight size={16} /></span></a>}
          <div className="ct-card ct-topics" data-v>
            <span className="ct-k">What can we help with?</span>
            <div className="ct-chips">
              <a href="/contact?type=admission#enquire"><GraduationCap size={16} /> Course admission</a>
              <a href="/contact?type=studio#enquire"><Mic size={16} /> Studio booking</a>
              <a href="/contact?type=production#enquire"><Clapperboard size={16} /> Production work</a>
            </div>
          </div>
          <div className="ct-card ct-social" data-v>
            <span className="ct-brand"><img src="/brand/rakvih-mark.png" alt="" width={331} height={373} /><span><b>{site.name}</b><small>{site.parent}</small></span></span>
            {social.length > 0 && <span className="ct-social-links">{social.map(s => <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>{socialIcons[s.label]}<span>{s.label}</span></a>)}</span>}
          </div>
        </div>
      </div>
    </section>

    <FormSection eyebrow="Send an enquiry" title="Tell us how we" italic="can help."
      sub="Pick what you’re interested in — course admission, podcast studio booking, production services, or a general question — and our team will review it right away." type="general" allowTypeSwitch fromUrl courseOptions={courseOptions} />
  </main>;
}
