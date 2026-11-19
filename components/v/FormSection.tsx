import { MessageCircle, MapPin } from 'lucide-react';
import EnquiryForm from '@/components/EnquiryForm';
import Words from '@/components/v/Words';
import { site, whatsappLink, type EnquiryType } from '@/lib/site';

/** Editorial enquiry spread: story + steps on the left, the WhatsApp enquiry form as a paper card on the right. */
export default function FormSection({ id = 'enquire', eyebrow, title, italic, sub, type, course, allowTypeSwitch, courseOptions, note, formTitle = 'A little about you.' }: {
  id?: string; tone?: string; eyebrow: string; title: string; italic?: string; sub: string;
  type?: EnquiryType; course?: string; allowTypeSwitch?: boolean; courseOptions?: string[]; points?: string[]; note?: string; formTitle?: string;
}) {
  const n = title.split(' ').length;
  return <section className="pm-enq pm-sec" id={id} data-dark>
    <div className="pm-wrap pm-enq-grid">
      <div className="pm-enq-copy">
        <div data-v>
          <p className="pm-label on-dark rule" style={{ marginBottom: 28 }}>{eyebrow}</p>
          <h2 className="pm-h2 on-dark"><Words text={title} />{italic && <> <em><Words text={italic} start={n} /></em></>}</h2>
        </div>
        <p className="pm-lede" style={{ color: '#b9b7a6' }}>{sub}</p>
        <ol className="pm-enq-steps">
          <li><span>i.</span><div><b>Choose what you need</b><small>A course, studio booking, production or a question.</small></div></li>
          <li><span>ii.</span><div><b>Add your details</b><small>Name, mobile number and anything we should know.</small></div></li>
          <li><span>iii.</span><div><b>Send on WhatsApp</b><small>Your message opens ready to send — our team replies there.</small></div></li>
        </ol>
        <div className="pm-enq-contact">
          <a href={whatsappLink(`Hello ${site.name}, I’d like to know more.`)} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} />{site.whatsappDisplay}</a>
          <span><MapPin size={16} />{site.location}</span>
        </div>
        {note && <p className="pm-small">{note}</p>}
      </div>
      <div className="pm-form-card" data-v>
        <header>
          <div><p className="pm-label"><span className="pm-dot" /> Opens in WhatsApp</p><h3>{formTitle}</h3></div>
          <img src="/brand/rakvih-mark-128.png" alt="" />
        </header>
        <EnquiryForm type={type} course={course} allowTypeSwitch={allowTypeSwitch} courseOptions={courseOptions} />
        <p className="pm-fine">Beginners welcome — no creative experience needed.</p>
      </div>
    </div>
  </section>;
}
