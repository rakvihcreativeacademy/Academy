import { MessageCircle, MapPin, Check } from 'lucide-react';
import EnquiryForm from '@/components/EnquiryForm';
import Words from '@/components/v/Words';
import { site, whatsappLink, type EnquiryType } from '@/lib/site';

/** Full-width enquiry block: story + steps on the left, the WhatsApp enquiry form on the right. */
export default function FormSection({ id = 'enquire', tone = 'olive', eyebrow, title, italic, sub, type, course, allowTypeSwitch, points, note }: {
  id?: string; tone?: 'olive' | 'forest' | 'sand' | 'yellow'; eyebrow: string; title: string; italic?: string; sub: string;
  type?: EnquiryType; course?: string; allowTypeSwitch?: boolean; points?: string[]; note?: string;
}) {
  const n = title.split(' ').length;
  return <section className={'v-form-sec t-' + tone} id={id}>
    <div className="v-form-glow" aria-hidden="true" />
    <div className="v-wrap v-form-grid">
      <div className="v-form-copy" data-v>
        <p className="v-eyebrow">{eyebrow}</p>
        <h2><Words text={title} />{italic && <> <em><Words text={italic} start={n} /></em></>}</h2>
        <p className="v-form-sub">{sub}</p>
        <ol className="v-steps">
          <li><span>01</span><div><b>Choose what you need</b><small>A course, studio booking, production or a question.</small></div></li>
          <li><span>02</span><div><b>Add your details</b><small>Name, mobile number and anything we should know.</small></div></li>
          <li><span>03</span><div><b>Send on WhatsApp</b><small>Your message opens ready to send — our team replies there.</small></div></li>
        </ol>
        {points && <ul className="v-form-points">{points.map(p => <li key={p}><Check size={15} />{p}</li>)}</ul>}
        <div className="v-form-contact">
          <a href={whatsappLink(`Hello ${site.name}, I’d like to know more.`)} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} />{site.whatsappDisplay}</a>
          <span><MapPin size={16} />{site.location}</span>
        </div>
        {note && <p className="v-form-note">{note}</p>}
      </div>
      <div className="v-form-card" data-v>
        <div className="v-form-card-head"><img src="/brand/rakvih-mark-128.png" alt="" /><div><b>Send your enquiry</b><small>Opens in WhatsApp · {site.whatsappDisplay}</small></div><span className="v-live-dot" /></div>
        <EnquiryForm type={type} course={course} allowTypeSwitch={allowTypeSwitch} />
      </div>
    </div>
  </section>;
}
