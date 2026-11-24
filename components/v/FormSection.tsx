import { Phone, MapPin } from 'lucide-react';
import EnquiryForm from '@/components/EnquiryForm';
import Words from '@/components/v/Words';
import { site, type EnquiryType } from '@/lib/site';

/** Editorial enquiry spread: story + steps on the left, direct database-backed enquiry form on the right. */
export default function FormSection({
  id = 'enquire',
  eyebrow,
  title,
  italic,
  sub,
  type,
  course,
  allowTypeSwitch,
  courseOptions,
  fromUrl,
  note,
  formTitle = 'A little about you.',
}: {
  id?: string;
  tone?: string;
  eyebrow: string;
  title: string;
  italic?: string;
  sub: string;
  type?: EnquiryType;
  course?: string;
  allowTypeSwitch?: boolean;
  courseOptions?: string[];
  fromUrl?: boolean;
  points?: string[];
  note?: string;
  formTitle?: string;
}) {
  const n = title.split(' ').length;
  return (
    <section className="pm-enq pm-sec" id={id} data-dark>
      <div className="pm-wrap pm-enq-grid">
        <div className="pm-enq-copy">
          <div data-v>
            <p className="pm-label on-dark rule" style={{ marginBottom: 28 }}>{eyebrow}</p>
            <h2 className="pm-h2 on-dark">
              <Words text={title} />
              {italic && <> <em><Words text={italic} start={n} /></em></>}
            </h2>
          </div>
          <p className="pm-lede" style={{ color: '#b9b7a6' }}>{sub}</p>
          <ol className="pm-enq-steps">
            <li><span>i.</span><div><b>Choose what you’re interested in</b><small>Course admission, podcast studio booking, production services, or a general question.</small></div></li>
            <li><span>ii.</span><div><b>Share your details</b><small>Add your name, contact info, preferred timing, and anything we should know.</small></div></li>
            <li><span>iii.</span><div><b>We’ll get back to you</b><small>Your enquiry goes straight to our team — we’ll review and reach out shortly.</small></div></li>
          </ol>
          <div className="pm-enq-contact">
            <a href={`tel:+${site.whatsapp}`}><Phone size={16} />{site.whatsappDisplay}</a>
            <span><MapPin size={16} />{site.location}</span>
          </div>
          {note && <p className="pm-small">{note}</p>}
        </div>
        <div className="pm-form-card" data-v>
          <header>
            <div><p className="pm-label"><span className="pm-dot" /> Direct enquiry</p><h3>{formTitle}</h3></div>
            <img src="/brand/rakvih-mark-128.png" alt="" />
          </header>
          <EnquiryForm type={type} course={course} allowTypeSwitch={allowTypeSwitch} courseOptions={courseOptions} fromUrl={fromUrl} />
          <p className="pm-fine">Beginners welcome — no creative experience needed.</p>
        </div>
      </div>
    </section>
  );
}
