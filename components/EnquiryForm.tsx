"use client";
import { useState } from 'react';
import { toast } from 'sonner';
import { Send, CheckCircle2 } from 'lucide-react';
import { courses } from '@/lib/courses';
import { submitEnquiry } from '@/actions/enquiries';
import { enquiryTypes, learningModes, productionOptions, studioOptions, site, whatsappLink, type EnquiryType } from '@/lib/site';

const optionsFor: Record<EnquiryType, string[]> = {
  admission: courses.map(c => c.title),
  studio: studioOptions,
  production: productionOptions,
  general: ['Course admission', 'Podcast studio booking', 'Production services', 'Collaboration', 'Something else'],
};
const interestLabel: Record<EnquiryType, string> = {
  admission: 'Course interested in', studio: 'Studio service', production: 'Service interested in', general: 'I’m interested in',
};

/** Enquiry form: validates, saves for the admin panel (if connected) and sends the details to RAKVIH on WhatsApp. */
export default function EnquiryForm({ course = '', type: initialType = 'admission', allowTypeSwitch = false, courseOptions }: { course?: string; type?: EnquiryType; allowTypeSwitch?: boolean; courseOptions?: string[] }) {
  const [type, setType] = useState<EnquiryType>(initialType);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    data.type = type;

    // Open the WhatsApp tab straight away (inside the click) so browsers don't block it as a pop-up.
    const tab = window.open('', '_blank');
    setBusy(true);
    try {
      const result = await submitEnquiry(data);
      if (!result.ok) { tab?.close(); toast.error(result.error); return; }
      const lines = [
        `Hello ${site.name}! 👋`,
        `New *${enquiryTypes[type]}* enquiry from the website:`,
        ' ',
        `*Name:* ${data.name}`,
        `*Mobile:* ${data.phone}`,
        `*Email:* ${data.email}`,
        `*${interestLabel[type]}:* ${data.interest}`,
        data.preferred && `*Preferred batch / date:* ${data.preferred}`,
        data.learning_mode && `*Learning mode:* ${data.learning_mode}`,
        data.message && `*Message:* ${data.message}`,
      ].filter(Boolean).join('\n');
      const url = whatsappLink(lines);
      if (tab) tab.location.href = url; else window.location.href = url;
      setSent(true);
      form.reset();
      toast.success('Opening WhatsApp — just press send to share your details with our team.');
    } catch {
      tab?.close();
      toast.error('Something went wrong. Please try again or message us on WhatsApp.');
    } finally {
      setBusy(false);
    }
  }

  return <form className="panel enquiry-form" onSubmit={onSubmit}>
    {allowTypeSwitch && <div className="type-switch" role="radiogroup" aria-label="Enquiry type">
      {(Object.keys(enquiryTypes) as EnquiryType[]).map(t =>
        <button type="button" role="radio" aria-checked={type === t} key={t} className={type === t ? 'active' : ''} onClick={() => setType(t)}>{enquiryTypes[t]}</button>)}
    </div>}
    <label>Full name<input name="name" required maxLength={120} autoComplete="name" placeholder="Your full name" /></label>
    <div className="form-row">
      <label>Mobile number<input name="phone" type="tel" required minLength={8} maxLength={20} pattern="[+()0-9\s\-]{8,20}" title="Digits, spaces, +, - and brackets only" autoComplete="tel" placeholder="+91 98765 43210" /></label>
      <label>Email address<input type="email" name="email" required autoComplete="email" placeholder="you@example.com" /></label>
    </div>
    <label>{interestLabel[type]}
      <select name="interest" key={type} defaultValue={type === 'admission' ? course : ''} required>
        <option value="">Select an option</option>
        {(type === 'admission' && courseOptions ? courseOptions : optionsFor[type]).map(c => <option key={c}>{c}</option>)}
      </select>
    </label>
    {(type === 'admission' || type === 'studio') && <div className="form-row">
      <label>{type === 'studio' ? 'Preferred recording date' : 'Preferred batch'}<input name="preferred" maxLength={120} placeholder={type === 'studio' ? 'e.g. 12 Dec, afternoon' : 'e.g. Weekend, January'} /></label>
      {type === 'admission'
        ? <label>Learning mode<select name="learning_mode" defaultValue=""><option value="">Select (optional)</option>{learningModes.map(m => <option key={m}>{m}</option>)}</select></label>
        : <span />}
    </div>}
    <label>Message<textarea name="message" rows={3} maxLength={3000} placeholder="Your goals, questions or project details" /></label>
    <button disabled={busy} className="button w-full whatsapp-submit">
      {busy ? 'Sending…' : <><Send size={18} /> Send enquiry on WhatsApp</>}
    </button>
    {sent
      ? <p className="form-note ok"><CheckCircle2 size={16} /> Thanks! If WhatsApp didn’t open, message us on {site.whatsappDisplay}.</p>
      : <p className="form-note">Your details open in WhatsApp, ready to send to our team on {site.whatsappDisplay}.</p>}
  </form>;
}
