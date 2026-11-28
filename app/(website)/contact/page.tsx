import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import FormSection from '@/components/v/FormSection';
import { getPageContent } from '@/lib/cms/server';
import { isCourseEnabled } from '@/lib/cms/schema';

export const metadata: Metadata = { title: 'Contact us' };

export default async function Contact() {
  const courseDoc = await getPageContent('courses');
  const courseOptions = courseDoc.sections.flatMap(sec => sec.items.filter(it => isCourseEnabled(it)).map(it => it.title));
  return <main className="pm-page pm-contact">
    <section className="contact-hero" aria-labelledby="contact-hero-title" data-hero data-dark>
      <div className="pm-wrap contact-hero-grid">
        <div className="contact-hero-copy">
          <h1 id="contact-hero-title">Let’s <em>talk.</em></h1>
          <p>Ask about a course, book the podcast studio, or tell us what you’d like to create.</p>
          <div className="pm-row on-dark">
            <a href="#enquire" className="pm-btn">Send an enquiry <ArrowUpRight size={15} /></a>
          </div>
        </div>
        <div className="contact-hero-art">
          <img
            src="/images/banners/neon-contact.jpg"
            alt="Cobalt telephone and microphone lit in blue and violet"
            width={1672}
            height={941}
            fetchPriority="high"
            decoding="async"
          />
        </div>
      </div>
    </section>

    <FormSection eyebrow="Send an enquiry" title="Tell us how we" italic="can help."
      sub="Pick what you’re interested in — course admission, podcast studio booking, production services, or a general question — and our team will review it right away." type="general" allowTypeSwitch fromUrl courseOptions={courseOptions} />
  </main>;
}
