"use client";
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';
import { courses } from '@/lib/courses';
import { submitEnquiry } from '@/actions/enquiries';
import { enquiryTypes, learningModes, type EnquiryType } from '@/lib/site';

const optionsFor: Record<EnquiryType, string[]> = {
  admission: courses.map(c =>
    c.slug === 'video-editing'
      ? `${c.title} (Live — Enrolling Now)`
      : `${c.title} (Upcoming)`,
  ),
  studio: [
    'Podcast studio rental (Hourly / Half-day / Full-day)',
    'Audio podcast recording',
    'Multi-camera video podcast recording',
    'Podcast editing, mixing & mastering',
    'Corporate / interview podcast production',
    'Complete end-to-end podcast package',
  ],
  production: [
    'Corporate & brand promotional videos',
    'Product advertisements',
    'Event videography & photography',
    'YouTube & social media reels production',
    'Documentary & short film production',
    'Commercial photography',
    'Post-production & video editing services',
  ],
  general: [
    'Course admission & batch details',
    'Podcast studio booking & availability',
    'Production services enquiry',
    'Workshop / college collaboration',
    'Brand partnership / sponsorship',
    'Careers / trainer opportunity',
    'General question',
  ],
};

const interestLabel: Record<EnquiryType, string> = {
  admission: 'Course interested in',
  studio: 'Studio service interested in',
  production: 'Production service interested in',
  general: 'What are you interested in?',
};

/** Direct website enquiry form: validates and stores submissions straight into Admin Panel -> Enquiries. */
export default function EnquiryForm({
  course: initialCourse = '',
  type: initialType = 'admission',
  allowTypeSwitch = false,
  courseOptions,
  fromUrl = false,
}: {
  course?: string;
  type?: EnquiryType;
  allowTypeSwitch?: boolean;
  courseOptions?: string[];
  fromUrl?: boolean;
}) {
  const [type, setType] = useState<EnquiryType>(initialType);
  const [course, setCourse] = useState(initialCourse);

  useEffect(() => {
    if (!fromUrl) return;
    const q = new URLSearchParams(window.location.search);
    const t = q.get('type') as EnquiryType | null;
    if (t && t in enquiryTypes) setType(t);
    const c = q.get('course');
    if (c) setCourse(c);
  }, [fromUrl]);

  const [busy, setBusy] = useState(false);
  const [sentInfo, setSentInfo] = useState<{ name: string; interest: string } | null>(null);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    data.type = type;

    setBusy(true);
    setError('');
    try {
      const result = await submitEnquiry(data);
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      setSentInfo({ name: data.name, interest: data.interest });
      form.reset();
      toast.success('Enquiry received! Our team will get back to you shortly.');
    } catch {
      const msg = 'Something went wrong while sending your enquiry. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  if (sentInfo) {
    return (
      <div className="pm-pay-success" style={{ padding: '18px 4px' }}>
        <div className="pm-pay-check"><CheckCircle2 size={32} /></div>
        <h3>Enquiry received!</h3>
        <p className="pm-small" style={{ maxWidth: 420 }}>
          Thank you, <strong>{sentInfo.name}</strong>. Your enquiry for <strong>{sentInfo.interest}</strong> has been
          saved with our team — we’ll reach out to you shortly.
        </p>
        <button type="button" className="pm-btn sm" style={{ marginTop: 8 }} onClick={() => setSentInfo(null)}>
          Send another enquiry
        </button>
      </div>
    );
  }

  const options = type === 'admission' && courseOptions ? courseOptions : optionsFor[type];

  return (
    <form className="panel enquiry-form" onSubmit={onSubmit}>
      {allowTypeSwitch && (
        <div className="type-switch" role="radiogroup" aria-label="Enquiry category">
          {(Object.keys(enquiryTypes) as EnquiryType[]).map(t => (
            <button
              type="button"
              role="radio"
              aria-checked={type === t}
              key={t}
              className={type === t ? 'active' : ''}
              onClick={() => { setType(t); setError(''); }}
            >
              {enquiryTypes[t]}
            </button>
          ))}
        </div>
      )}

      <label>
        Full name
        <input name="name" required maxLength={120} autoComplete="name" placeholder="Your full name" />
      </label>

      <div className="form-row">
        <label>
          Mobile number
          <input
            name="phone"
            type="tel"
            required
            minLength={8}
            maxLength={20}
            pattern="[+()0-9\s\-]{8,20}"
            title="Digits, spaces, +, - and brackets only"
            autoComplete="tel"
            placeholder="+91 98765 43210"
          />
        </label>
        <label>
          Email address
          <input type="email" name="email" required autoComplete="email" placeholder="you@example.com" />
        </label>
      </div>

      <label>
        {interestLabel[type]}
        <select name="interest" key={type + course} defaultValue={type === 'admission' ? course : ''} required>
          <option value="">Select what you’re interested in</option>
          {options.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>

      {(type === 'admission' || type === 'studio') && (
        <div className="form-row">
          <label>
            {type === 'studio' ? 'Preferred recording date / time' : 'Preferred batch / month'}
            <input
              name="preferred"
              maxLength={120}
              placeholder={type === 'studio' ? 'e.g. This Saturday, afternoon' : 'e.g. Weekend batch, next month'}
            />
          </label>
          {type === 'admission' ? (
            <label>
              Learning mode
              <select name="learning_mode" defaultValue="">
                <option value="">Select (optional)</option>
                {learningModes.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
          ) : <span />}
        </div>
      )}

      <label>
        Message / details
        <textarea
          name="message"
          rows={3}
          maxLength={3000}
          placeholder="Tell us about your goals, preferred schedule, or project details"
        />
      </label>

      {error && <p className="pm-pay-error" role="alert">{error}</p>}

      <button disabled={busy} className="button w-full whatsapp-submit">
        {busy ? <><Loader2 size={18} className="pm-spin" /> Submitting enquiry…</> : <><Send size={17} /> Submit enquiry</>}
      </button>

      <p className="form-note">
        Your enquiry goes straight to the RAKVIH Digital team — no external app redirect required.
      </p>
    </form>
  );
}
