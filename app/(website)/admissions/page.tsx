import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowUpRight, Check, MessageCircle, MoveDown } from 'lucide-react';
import { getPageContent } from '@/lib/cms/server';
import EnquiryForm from '@/components/EnquiryForm';
import { site, whatsappLink, type EnquiryType } from '@/lib/site';

export const metadata: Metadata = { title: 'Admissions' };
const types: EnquiryType[] = ['admission', 'studio', 'production', 'general'];
export default async function Admissions({ searchParams }: { searchParams: Promise<{ course?: string; type?: string }> }) {
  const p = await searchParams;
  const catalogue = await getPageContent('courses');
  const courseOptions = catalogue.sections.flatMap(s => s.items.map(i => i.title));
  const type = (types.includes(p.type as EnquiryType) ? p.type : 'admission') as EnquiryType;
  return <main className="apply-page">
    <section className="apply-hero v-wrap">
      <div className="apply-hero-copy"><p className="v-eyebrow">ADMISSIONS AT RAKVIH</p><h1>A creative career.<br /><em>A beginning<br />that’s yours.</em></h1><p>You bring the curiosity. We’ll help you build the skills. Discover hands-on learning in filmmaking, editing, photography and more.</p><a href="#enquire" className="v-pill-sun">Find your course <ArrowUpRight size={17} /></a><span className="apply-welcome"><Check size={15} />No experience? You’re welcome here.</span></div>
      <div className="apply-hero-visual"><Image src="/images/course-content-creation.webp" alt="Illustration of a creator recording a video" fill priority sizes="(max-width: 760px) 100vw, 50vw" /><span className="apply-image-label">YOUR IDEAS. REAL POSSIBILITIES.</span><div className="apply-photo-note"><span>FROM FIRST TRY</span><strong>to your next big thing.</strong><ArrowUpRight size={25} /></div></div>
    </section>
    <section className="apply-process v-wrap" aria-label="How admissions work">{[{n:'01',t:'Tell us what excites you',d:'Choose a course and share a little about your goals.'},{n:'02',t:'Let’s talk possibilities',d:'Our team shares course details, fees and batch availability.'},{n:'03',t:'Start making things',d:'Find your direction and take the next step with RAKVIH.'}].map(s=><div key={s.n}><span>{s.n}</span><h2>{s.t}</h2><p>{s.d}</p></div>)}</section>
    <section className="apply-enquiry" id="enquire"><div className="v-wrap apply-enquiry-grid"><aside><p className="v-eyebrow">YOUR FIRST STEP</p><h2>Big ideas start<br />with a simple<br /><em>hello.</em></h2><p>Tell us what you’d love to learn. We’ll help you explore the right course, learning mode and next available batch.</p><ul>{['Beginners and career changers welcome','Practical, project-based learning','Course-completion certificate'].map(x=><li key={x}><Check size={17} />{x}</li>)}</ul><a className="apply-chat" href={whatsappLink(`Hello ${site.name}, I’d like to know more about admissions.`)} target="_blank" rel="noopener noreferrer"><MessageCircle size={21} /><span>Want to speak to us?<strong>{site.whatsappDisplay}</strong></span><ArrowUpRight size={18} /></a><MoveDown className="apply-down" size={46} strokeWidth={1} /></aside><div className="home-admissions-form apply-form-card"><span className="apply-form-label">LET’S GET TO KNOW YOU</span><h3>Your creative journey starts here.</h3><p>Share your details. We’ll take it from there.</p><EnquiryForm courseOptions={courseOptions} type={type} course={p.course} allowTypeSwitch /><p className="apply-form-privacy">Submitting opens WhatsApp with your enquiry ready to send.</p></div></div></section>
  </main>;
}
