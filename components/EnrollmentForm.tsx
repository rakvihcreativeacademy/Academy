'use client';
import { useState } from 'react';
import { CheckCircle2, CreditCard, FileText, Loader2, ShieldCheck, Upload } from 'lucide-react';
import { formatInr, type CourseOffering } from '@/lib/payments';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (res: { error?: { description?: string } }) => void) => void;
    };
  }
}

const DEFAULT_LEARNING_MODE = 'In-studio (Bengaluru)';
const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const OCCUPATIONS = ['Student', 'Working Professional', 'Freelancer', 'Content Creator', 'Business Owner', 'Other'];
const EXPERIENCE_LEVELS = ['Complete Beginner', 'Some Basic Editing', 'Intermediate', 'Advanced'];

function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise(resolve => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-razorpay-checkout]');
    if (existing) {
      existing.addEventListener('load', () => resolve(Boolean(window.Razorpay)), { once: true });
      existing.addEventListener('error', () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpayCheckout = '1';
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

type Receipt = {
  id: string;
  course_title: string;
  student_name: string;
  amount_paise: number;
  razorpay_payment_id: string;
};

export default function EnrollmentForm({
  offering,
  onBusyChange,
  onDone,
}: {
  offering: CourseOffering;
  onBusyChange?: (busy: boolean) => void;
  onDone?: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState(GENDERS[0]);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [education, setEducation] = useState('');
  const [occupation, setOccupation] = useState(OCCUPATIONS[0]);
  const [experienceLevel, setExperienceLevel] = useState(EXPERIENCE_LEVELS[0]);
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [goals, setGoals] = useState('');

  const [busy, setBusy] = useState(false);
  const [stageText, setStageText] = useState('');
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const setBusyState = (v: boolean, text = '') => {
    setBusy(v);
    setStageText(text);
    onBusyChange?.(v);
  };

  const handleAadhaarInput = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 12);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    setAadhaarNumber(formatted);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanAadhaar = aadhaarNumber.replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar number.');
      return;
    }
    if (!aadhaarFile) {
      setError('Please upload a clear copy of your Aadhaar card (JPG, PNG, WebP, or PDF).');
      return;
    }
    if (aadhaarFile.size > 5 * 1024 * 1024) {
      setError('Aadhaar file must be smaller than 5 MB.');
      return;
    }

    setBusyState(true, 'Uploading Aadhaar document…');
    try {
      // 1. Upload Aadhaar document securely to private Supabase bucket
      const uploadBody = new FormData();
      uploadBody.append('file', aadhaarFile);
      const upRes = await fetch('/api/enrollments/upload-aadhaar', { method: 'POST', body: uploadBody });
      const upData = await upRes.json();
      if (!upRes.ok || !upData?.path) {
        setError(upData?.error || 'Could not upload Aadhaar document. Please try again.');
        setBusyState(false);
        return;
      }

      // 2. Load Razorpay Checkout script
      setBusyState(true, 'Preparing Razorpay checkout…');
      const ok = await loadRazorpayScript();
      if (!ok || !window.Razorpay) {
        setError('Unable to load Razorpay Checkout. Please check your internet connection and try again.');
        setBusyState(false);
        return;
      }

      // 3. Create Razorpay Order & save complete enrollment in Supabase
      const orderRes = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseSlug: 'video-editing',
          name,
          email,
          phone,
          dateOfBirth,
          gender,
          address,
          city,
          state: stateName,
          pincode,
          aadhaarNumber: cleanAadhaar,
          aadhaarDocPath: upData.path,
          aadhaarDocName: upData.name,
          education,
          occupation,
          experienceLevel,
          learningMode: DEFAULT_LEARNING_MODE,
          emergencyContactName,
          emergencyContactPhone,
          goals,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        setError(orderData?.error || 'Could not start payment. Please review your details.');
        setBusyState(false);
        return;
      }

      // 4. Open Razorpay Checkout
      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amountPaise,
        currency: orderData.currency,
        name: 'RAKVIH Digital',
        description: orderData.courseTitle,
        image: '/brand/rakvih-mark-128.png',
        order_id: orderData.orderId,
        prefill: { name, email, contact: phone },
        notes: { course: 'Professional Video Editing', mode: DEFAULT_LEARNING_MODE },
        theme: { color: '#4f5723' },
        modal: {
          ondismiss: () => setBusyState(false),
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          setBusyState(true, 'Verifying payment…');
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData?.ok) {
              setError(verifyData?.error || 'Payment succeeded, but verification failed. Please contact admissions with your payment ID.');
              setBusyState(false);
              return;
            }
            setReceipt(verifyData.enrollment);
            setBusyState(false);
          } catch {
            setError('Could not verify payment right now. Please contact admissions.');
            setBusyState(false);
          }
        },
      });

      rzp.on('payment.failed', res => {
        setError(res?.error?.description || 'Payment did not complete. Please try again.');
        setBusyState(false);
      });

      rzp.open();
    } catch {
      setError('Something went wrong while submitting your enrollment. Please try again.');
      setBusyState(false);
    }
  };

  if (receipt) {
    return <div className="pm-pay-success">
      <span className="pm-pay-check"><CheckCircle2 size={34} /></span>
      <p className="pm-label">Payment verified · Under admin review</p>
      <h3>Application submitted for {receipt.course_title}</h3>
      <p className="pm-small">
        Thank you, <strong>{receipt.student_name}</strong>. Your payment and Aadhaar KYC have been received.
        Once our admissions admin reviews and approves your application, your student portal login credentials will be created for <strong>{email}</strong>.
      </p>
      <dl className="pm-pay-receipt">
        <div><dt>Amount paid</dt><dd>{formatInr(Math.round(receipt.amount_paise / 100))}</dd></div>
        <div><dt>Payment ID</dt><dd className="pm-num">{receipt.razorpay_payment_id}</dd></div>
        <div><dt>Application status</dt><dd>Paid · Pending Admin Approval</dd></div>
      </dl>
      {onDone && <button type="button" className="pm-btn" onClick={onDone}>Done</button>}
    </div>;
  }

  const disabled = !offering.is_live || !offering.enrollments_enabled;

  return <form className="pm-pay-form pm-enroll-form" onSubmit={submit}>
    <div className="pm-enroll-summary">
      <div>
        <span className="cs-pill is-live"><i aria-hidden="true" />Live enrollment</span>
        <strong>{offering.title}</strong>
        <small>{offering.batch_label} · {offering.duration_label}</small>
      </div>
      <div className="pm-enroll-fee">
        <b>{formatInr(offering.price_inr)}</b>
        <span>Programme fee</span>
      </div>
    </div>

    <fieldset className="pm-enroll-group">
      <legend>01 · Personal details</legend>
      <label>
        Full name (as on Aadhaar) *
        <input required minLength={2} maxLength={120} value={name} onChange={e => setName(e.target.value)} placeholder="Your full legal name" />
      </label>
      <div className="pm-pay-row">
        <label>
          Email address *
          <input type="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>
        <label>
          Phone / WhatsApp *
          <input type="tel" required pattern="^[+()0-9 -]{8,20}$" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" />
        </label>
      </div>
      <div className="pm-pay-row">
        <label>
          Date of birth *
          <input type="date" required value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
        </label>
        <label>
          Gender *
          <select value={gender} onChange={e => setGender(e.target.value)}>
            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>
      </div>
    </fieldset>

    <fieldset className="pm-enroll-group">
      <legend>02 · Residential address</legend>
      <label>
        Street address *
        <input required minLength={5} maxLength={400} value={address} onChange={e => setAddress(e.target.value)} placeholder="House / flat no., street, area" />
      </label>
      <div className="pm-pay-row three">
        <label>
          City *
          <input required minLength={2} maxLength={100} value={city} onChange={e => setCity(e.target.value)} placeholder="Bengaluru" />
        </label>
        <label>
          State *
          <input required minLength={2} maxLength={100} value={stateName} onChange={e => setStateName(e.target.value)} placeholder="Karnataka" />
        </label>
        <label>
          Pincode *
          <input required pattern="^[0-9]{6}$" maxLength={6} inputMode="numeric" value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="560001" />
        </label>
      </div>
    </fieldset>

    <fieldset className="pm-enroll-group">
      <legend>03 · Aadhaar KYC verification</legend>
      <label>
        Aadhaar number (12 digits) *
        <input
          required
          inputMode="numeric"
          maxLength={14}
          value={aadhaarNumber}
          onChange={e => handleAadhaarInput(e.target.value)}
          placeholder="XXXX XXXX XXXX"
        />
      </label>
      <label>
        Upload Aadhaar card (JPG, PNG, WebP, or PDF · max 5 MB) *
        <span className={'pm-upload-box' + (aadhaarFile ? ' has-file' : '')}>
          {aadhaarFile ? <FileText size={18} /> : <Upload size={18} />}
          <span>{aadhaarFile ? `${aadhaarFile.name} (${(aadhaarFile.size / 1024).toFixed(0)} KB)` : 'Choose Aadhaar card file'}</span>
          <input
            type="file"
            required
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={e => setAadhaarFile(e.target.files?.[0] ?? null)}
          />
        </span>
      </label>
    </fieldset>

    <fieldset className="pm-enroll-group">
      <legend>04 · Background</legend>
      <div className="pm-pay-row">
        <label>
          Highest qualification *
          <input required minLength={2} maxLength={120} value={education} onChange={e => setEducation(e.target.value)} placeholder="e.g. B.Sc / 12th / Diploma" />
        </label>
        <label>
          Current role *
          <select value={occupation} onChange={e => setOccupation(e.target.value)}>
            {OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
      </div>
      <div className="pm-pay-row single">
        <label>
          Video editing experience *
          <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)}>
            {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
      </div>
      <div className="pm-pay-row">
        <label>
          Emergency contact name *
          <input required minLength={2} maxLength={120} value={emergencyContactName} onChange={e => setEmergencyContactName(e.target.value)} placeholder="Parent / guardian name" />
        </label>
        <label>
          Emergency contact phone *
          <input type="tel" required pattern="^[+()0-9 -]{8,20}$" value={emergencyContactPhone} onChange={e => setEmergencyContactPhone(e.target.value)} placeholder="+91 98765 43210" />
        </label>
      </div>
      <label>
        Creative goals (optional)
        <textarea rows={2} maxLength={1500} value={goals} onChange={e => setGoals(e.target.value)} placeholder="Tell us what you'd like to create or build after this programme…" />
      </label>
    </fieldset>

    {error && <p className="pm-pay-error" role="alert">{error}</p>}

    <button type="submit" className="pm-btn pm-pay-submit" disabled={busy || disabled}>
      {busy ? <><Loader2 size={16} className="pm-spin" /> {stageText || 'Processing…'}</>
        : disabled ? 'Online enrollment currently paused'
          : <><CreditCard size={16} /> Submit &amp; Pay {formatInr(offering.price_inr)} with Razorpay</>}
    </button>

    <p className="pm-pay-trust"><ShieldCheck size={15} /> Aadhaar stored privately for admin verification · Payment secured by Razorpay</p>
  </form>;
}
