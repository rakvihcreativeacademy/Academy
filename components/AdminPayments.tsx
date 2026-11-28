'use client';
import { useMemo, useState } from 'react';
import {
  CheckCircle2, CreditCard, IndianRupee, Search, Trash2, Save, Clock,
  AlertCircle, XCircle, RotateCcw, Eye, EyeOff, FileText,
  KeyRound, ShieldCheck, Copy, Check, UserCheck, UserX, RefreshCw, SlidersHorizontal, X,
} from 'lucide-react';
import { formatAadhaar, formatInr, type CourseOffering, type CoursePayment } from '@/lib/payments';
import {
  saveVideoEditingOffering,
  updateCoursePayment,
  deleteCoursePayment,
  getAadhaarSignedUrl,
  approveAndCreateStudentAccount,
  rejectCourseRegistration,
} from '@/actions/payments';

type ApprovalFilter = 'all' | 'pending' | 'approved' | 'rejected';
type PaymentFilter = 'all' | CoursePayment['status'];

const PAYMENT_META: Record<CoursePayment['status'], { label: string; cls: string }> = {
  paid: { label: 'Payment Done', cls: 'green' },
  created: { label: 'Not Paid', cls: 'amber' },
  failed: { label: 'Failed', cls: 'red' },
  refunded: { label: 'Refunded', cls: 'muted' },
};

const APPROVAL_META: Record<CoursePayment['approval_status'], { label: string; cls: string }> = {
  pending: { label: 'Pending Review', cls: 'amber' },
  approved: { label: 'Approved · Login Active', cls: 'green' },
  rejected: { label: 'Rejected', cls: 'red' },
};

function generateStrongPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let out = 'Rk!';
  for (let i = 0; i < 9; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function AdminPayments({
  initialOffering,
  initialPayments,
  setupNeeded,
}: {
  initialOffering: CourseOffering;
  initialPayments: CoursePayment[];
  setupNeeded: boolean;
}) {
  const [priceInr, setPriceInr] = useState(String(initialOffering.price_inr));
  const [batchLabel, setBatchLabel] = useState(initialOffering.batch_label);
  const [durationLabel, setDurationLabel] = useState(initialOffering.duration_label);
  const [isLive, setIsLive] = useState(initialOffering.is_live);
  const [enrollmentsEnabled, setEnrollmentsEnabled] = useState(initialOffering.enrollments_enabled);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [payments, setPayments] = useState<CoursePayment[]>(initialPayments);
  const [approvalFilter, setApprovalFilter] = useState<ApprovalFilter>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>(
    Object.fromEntries(initialPayments.map(p => [p.id, p.notes ?? ''])),
  );
  const [passwordDraft, setPasswordDraft] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, { ok: boolean; text: string; creds?: string }>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const paidPayments = useMemo(() => payments.filter(p => p.status === 'paid'), [payments]);
  const pendingApprovalCount = useMemo(() => payments.filter(p => (p.approval_status ?? 'pending') === 'pending').length, [payments]);
  const approvedCount = useMemo(() => payments.filter(p => p.approval_status === 'approved').length, [payments]);
  const rejectedCount = useMemo(() => payments.filter(p => p.approval_status === 'rejected').length, [payments]);
  const totalRevenueInr = useMemo(() => Math.round(paidPayments.reduce((sum, p) => sum + p.amount_paise, 0) / 100), [paidPayments]);
  const modesList = useMemo(
    () => Array.from(new Set(payments.map(p => p.learning_mode).filter((v): v is string => Boolean(v)))),
    [payments],
  );

  const q = query.trim().toLowerCase();
  const visible = useMemo(() => {
    return payments.filter(p => {
      const app = p.approval_status ?? 'pending';
      if (approvalFilter !== 'all' && app !== approvalFilter) return false;
      if (paymentFilter !== 'all' && p.status !== paymentFilter) return false;
      if (modeFilter !== 'all' && (p.learning_mode || '') !== modeFilter) return false;
      if (!q) return true;
      return [
        p.student_name, p.student_email, p.student_phone, p.city ?? '', p.aadhaar_number ?? '',
        p.razorpay_order_id, p.razorpay_payment_id ?? '', p.learning_mode ?? '', p.course_title,
      ].join(' ').toLowerCase().includes(q);
    });
  }, [payments, approvalFilter, paymentFilter, modeFilter, q]);

  const hasFilters = Boolean(q || approvalFilter !== 'all' || paymentFilter !== 'all' || modeFilter !== 'all');
  const resetFilters = () => {
    setApprovalFilter('all');
    setPaymentFilter('all');
    setModeFilter('all');
    setQuery('');
  };

  const onSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMsg(null);
    const res = await saveVideoEditingOffering({
      price_inr: Number(priceInr),
      batch_label: batchLabel,
      duration_label: durationLabel,
      is_live: isLive,
      enrollments_enabled: enrollmentsEnabled,
    });
    setSavingSettings(false);
    setSettingsMsg(res.ok ? { ok: true, text: 'Fee & registration settings saved.' } : { ok: false, text: res.error });
  };

  const onStatusChange = async (id: string, status: CoursePayment['status']) => {
    setBusyId(id);
    const res = await updateCoursePayment(id, { status });
    setBusyId(null);
    if (res.ok) setPayments(prev => prev.map(p => (p.id === id ? { ...p, status } : p)));
  };

  const onSaveNotes = async (id: string) => {
    setBusyId(id);
    const notes = notesDraft[id] ?? '';
    const res = await updateCoursePayment(id, { notes });
    setBusyId(null);
    if (res.ok) {
      setPayments(prev => prev.map(p => (p.id === id ? { ...p, notes } : p)));
      setFeedback(prev => ({ ...prev, [id]: { ok: true, text: 'Admin note saved.' } }));
    }
  };

  const onViewAadhaar = async (id: string, docPath: string) => {
    setBusyId(id);
    const res = await getAadhaarSignedUrl(docPath);
    setBusyId(null);
    if (res.ok) {
      window.open(res.url, '_blank', 'noopener,noreferrer');
    } else {
      setFeedback(prev => ({ ...prev, [id]: { ok: false, text: res.error } }));
    }
  };

  const onApprove = async (p: CoursePayment) => {
    const pw = (passwordDraft[p.id] ?? '').trim();
    if (pw.length < 8) {
      setFeedback(prev => ({ ...prev, [p.id]: { ok: false, text: 'Enter a password of at least 8 characters (or click Generate).' } }));
      return;
    }
    setBusyId(p.id);
    const res = await approveAndCreateStudentAccount(p.id, pw);
    setBusyId(null);
    if (!res.ok) {
      setFeedback(prev => ({ ...prev, [p.id]: { ok: false, text: res.error } }));
      return;
    }
    setPayments(prev => prev.map(item => (
      item.id === p.id
        ? { ...item, approval_status: 'approved', student_user_id: res.userId, approved_at: new Date().toISOString() }
        : item
    )));
    const creds = `Portal Login: ${window.location.origin}/login\nEmail: ${res.email}\nPassword: ${pw}`;
    setFeedback(prev => ({
      ...prev,
      [p.id]: {
        ok: true,
        text: res.updatedExisting
          ? `Approved! Updated password for existing student account (${res.email}).`
          : `Approved! Student account created for ${res.email}. Share the credentials below.`,
        creds,
      },
    }));
  };

  const onReject = async (id: string) => {
    if (!window.confirm('Mark this registration as Rejected?')) return;
    setBusyId(id);
    const res = await rejectCourseRegistration(id, notesDraft[id]);
    setBusyId(null);
    if (res.ok) {
      setPayments(prev => prev.map(p => (p.id === id ? { ...p, approval_status: 'rejected' } : p)));
      setFeedback(prev => ({ ...prev, [id]: { ok: true, text: 'Application marked as rejected.' } }));
    } else {
      setFeedback(prev => ({ ...prev, [id]: { ok: false, text: res.error } }));
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm('Delete this registration record permanently?')) return;
    setBusyId(id);
    const res = await deleteCoursePayment(id);
    setBusyId(null);
    if (res.ok) setPayments(prev => prev.filter(p => p.id !== id));
  };

  const copyCreds = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return <main className="admin-overview">
    <header className="overview-heading">
      <div>
        <span className="overview-breadcrumb">WORKSPACE / COURSE REGISTRATIONS</span>
        <h1>Course Registrations</h1>
        <p>Filter applications cleanly, inspect Aadhaar KYC, verify payments, and approve students to create their portal login.</p>
      </div>
    </header>

    {setupNeeded && (
      <div className="notice" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <AlertCircle size={17} />
        <span>Run <strong>supabase/004_payments.sql</strong> and <strong>supabase/005_enrollment_kyc.sql</strong> in Supabase SQL Editor.</span>
      </div>
    )}

    <div className="overview-stats">
      <article>
        <div><span>Payment done</span><CheckCircle2 size={17} /></div>
        <strong>{paidPayments.length}</strong>
        <p>Verified Razorpay payments</p>
      </article>
      <article>
        <div><span>Pending review</span><ShieldCheck size={17} /></div>
        <strong>{pendingApprovalCount}</strong>
        <p>Waiting for admin approval</p>
      </article>
      <article>
        <div><span>Total collected</span><IndianRupee size={17} /></div>
        <strong>{formatInr(totalRevenueInr)}</strong>
        <p>Professional Video Editing</p>
      </article>
      <article>
        <div><span>Active course fee</span><CreditCard size={17} /></div>
        <strong>{formatInr(Number(priceInr) || initialOffering.price_inr)}</strong>
        <p>{isLive && enrollmentsEnabled ? 'Live · Online checkout on' : 'Checkout paused'}</p>
      </article>
    </div>

    {/* Collapsible Course Fee Settings so registrations stay front & center */}
    <details className="cms-block adm-fee-collapse">
      <summary>
        <span className="adm-fee-summary">
          <SlidersHorizontal size={15} />
          <span>Fee &amp; Razorpay Checkout Settings — <strong>{formatInr(Number(priceInr) || initialOffering.price_inr)}</strong></span>
          <span className={'adm-badge ' + (isLive && enrollmentsEnabled ? 'green' : 'amber')}>
            {isLive && enrollmentsEnabled ? 'Checkout On' : 'Paused'}
          </span>
        </span>
      </summary>
      <form onSubmit={onSaveSettings} className="adm-fee-form">
        <div className="adm-fee-grid">
          <label>
            Course fee (INR)
            <input type="number" min={1} max={500000} required value={priceInr} onChange={e => setPriceInr(e.target.value)} />
          </label>
          <label>
            Batch label
            <input type="text" maxLength={120} value={batchLabel} onChange={e => setBatchLabel(e.target.value)} />
          </label>
          <label>
            Duration / format label
            <input type="text" maxLength={120} value={durationLabel} onChange={e => setDurationLabel(e.target.value)} />
          </label>
        </div>
        <div className="adm-fee-foot">
          <label className="cms-checkbox"><input type="checkbox" checked={isLive} onChange={e => setIsLive(e.target.checked)} />Course is Live</label>
          <label className="cms-checkbox"><input type="checkbox" checked={enrollmentsEnabled} onChange={e => setEnrollmentsEnabled(e.target.checked)} />Enable Razorpay checkout</label>
          <button type="submit" className="button small" disabled={savingSettings} style={{ marginLeft: 'auto' }}>
            <Save size={14} /> {savingSettings ? 'Saving…' : 'Save settings'}
          </button>
        </div>
        {settingsMsg && <p className={settingsMsg.ok ? 'adm-msg ok' : 'adm-msg err'}>{settingsMsg.text}</p>}
      </form>
    </details>

    {/* Minimal single-row filter bar + registrations list */}
    <section className="overview-content-panel adm-table-panel">
      <div className="adm-mini-bar">
        <div className="adm-mini-title">
          <strong>Registrations</strong>
          <span>{visible.length}{visible.length !== payments.length ? ` / ${payments.length}` : ''}</span>
        </div>

        <div className="adm-mini-controls">
          <label className="adm-mini-search">
            <Search size={14} />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search student, order ID…"
            />
            {query && (
              <button type="button" aria-label="Clear search" onClick={() => setQuery('')}>
                <X size={13} />
              </button>
            )}
          </label>

          <select aria-label="Approval status" value={approvalFilter} onChange={e => setApprovalFilter(e.target.value as ApprovalFilter)}>
            <option value="all">All status ({payments.length})</option>
            <option value="pending">Pending ({pendingApprovalCount})</option>
            <option value="approved">Approved ({approvedCount})</option>
            <option value="rejected">Rejected ({rejectedCount})</option>
          </select>

          <select aria-label="Payment status" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value as PaymentFilter)}>
            <option value="all">All payments</option>
            <option value="paid">Payment Done</option>
            <option value="created">Not Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          {modesList.length > 1 && (
            <select aria-label="Batch mode" value={modeFilter} onChange={e => setModeFilter(e.target.value)}>
              <option value="all">All batches</option>
              {modesList.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          )}

          {hasFilters && (
            <button type="button" className="adm-mini-reset" title="Reset filters" aria-label="Reset filters" onClick={resetFilters}>
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="adm-empty-box">
          <CreditCard size={28} />
          <p>No course registrations match your current filters.</p>
          {hasFilters && <button type="button" className="button secondary small" onClick={resetFilters}>Reset filters</button>}
        </div>
      ) : (
        <div className="adm-reg-list">
          {visible.map(p => {
            const payMeta = PAYMENT_META[p.status];
            const appStatus = p.approval_status ?? 'pending';
            const appMeta = APPROVAL_META[appStatus];
            const open = expandedId === p.id;
            const fb = feedback[p.id];

            return <article key={p.id} className={'adm-reg-row' + (open ? ' open' : '')}>
              <div className="adm-reg-head">
                <div className="adm-reg-main">
                  <div className="adm-reg-title">
                    <strong>{p.student_name}</strong>
                    <span className={'adm-badge ' + payMeta.cls}>
                      {p.status === 'paid' ? <CheckCircle2 size={12} /> : p.status === 'failed' ? <XCircle size={12} /> : p.status === 'refunded' ? <RotateCcw size={12} /> : <Clock size={12} />}
                      {payMeta.label}
                    </span>
                    <span className={'adm-badge ' + appMeta.cls}>
                      {appStatus === 'approved' ? <UserCheck size={12} /> : appStatus === 'rejected' ? <UserX size={12} /> : <ShieldCheck size={12} />}
                      {appMeta.label}
                    </span>
                  </div>
                  <div className="adm-reg-sub">
                    <span>{p.student_email}</span>
                    <span>{p.student_phone}</span>
                    <span>{p.learning_mode || 'Standard batch'}</span>
                    <span>{new Date(p.created_at).toLocaleDateString('en-IN', { days: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="adm-reg-actions">
                  <strong className="adm-reg-fee">{formatInr(Math.round(p.amount_paise / 100))}</strong>
                  <button
                    type="button"
                    className={'adm-review-btn' + (open ? ' active' : '')}
                    onClick={() => setExpandedId(open ? null : p.id)}
                  >
                    {open ? <><EyeOff size={14} /> Close</> : <><Eye size={14} /> Review</>}
                  </button>
                  <button type="button" className="act danger" aria-label="Delete record" disabled={busyId === p.id} onClick={() => onDelete(p.id)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {open && (
                <div className="adm-reg-detail">
                  <dl className="adm-detail-grid">
                    <div><dt>Date of birth / Gender</dt><dd>{p.date_of_birth || '—'} · {p.gender || '—'}</dd></div>
                    <div><dt>Address</dt><dd>{[p.address, p.city, p.state, p.pincode].filter(Boolean).join(', ') || '—'}</dd></div>
                    <div><dt>Education / Role</dt><dd>{p.education || '—'} · {p.occupation || '—'}</dd></div>
                    <div><dt>Editing experience</dt><dd>{p.experience_level || '—'}</dd></div>
                    <div><dt>Emergency contact</dt><dd>{p.emergency_contact_name ? `${p.emergency_contact_name} (${p.emergency_contact_phone || '—'})` : '—'}</dd></div>
                    <div><dt>Order / Payment ID</dt><dd className="mono">{p.razorpay_order_id} / {p.razorpay_payment_id || 'Pending'}</dd></div>
                    {p.goals && <div className="full"><dt>Creative goals</dt><dd>{p.goals}</dd></div>}
                  </dl>

                  <div className="adm-kyc-box">
                    <div>
                      <small>Aadhaar KYC</small>
                      <strong>{formatAadhaar(p.aadhaar_number)}</strong>
                      {p.aadhaar_doc_name && <span className="adm-kyc-file">({p.aadhaar_doc_name})</span>}
                    </div>
                    {p.aadhaar_doc_path ? (
                      <button type="button" className="button secondary small" disabled={busyId === p.id} onClick={() => onViewAadhaar(p.id, p.aadhaar_doc_path!)}>
                        <FileText size={14} /> View Aadhaar Card
                      </button>
                    ) : (
                      <small>No Aadhaar file uploaded</small>
                    )}
                  </div>

                  <div className="adm-approve-box">
                    <div className="adm-approve-head">
                      <strong><KeyRound size={15} /> {appStatus === 'approved' ? 'Student Account Active (Reset Password)' : 'Approve Application & Create Student Login'}</strong>
                      <span>Login email: <strong>{p.student_email}</strong></span>
                    </div>
                    <div className="adm-approve-row">
                      <input
                        type="text"
                        placeholder="Set student login password (min 8 chars)…"
                        value={passwordDraft[p.id] ?? ''}
                        onChange={e => setPasswordDraft(prev => ({ ...prev, [p.id]: e.target.value }))}
                      />
                      <button type="button" className="button secondary small" onClick={() => setPasswordDraft(prev => ({ ...prev, [p.id]: generateStrongPassword() }))}>
                        <RefreshCw size={13} /> Generate
                      </button>
                      <button type="button" className="button small" disabled={busyId === p.id} onClick={() => onApprove(p)}>
                        <UserCheck size={14} /> {appStatus === 'approved' ? 'Update Password' : 'Approve & Create'}
                      </button>
                      {appStatus !== 'rejected' && (
                        <button type="button" className="button danger small" disabled={busyId === p.id} onClick={() => onReject(p.id)}>
                          <UserX size={14} /> Reject
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="adm-notes-row">
                    <select
                      aria-label="Payment status"
                      value={p.status}
                      disabled={busyId === p.id}
                      onChange={e => onStatusChange(p.id, e.target.value as CoursePayment['status'])}
                    >
                      <option value="created">Not Paid</option>
                      <option value="paid">Payment Done</option>
                      <option value="failed">Payment Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Add admin notes (batch slot, KYC remark, etc.)…"
                      value={notesDraft[p.id] ?? ''}
                      onChange={e => setNotesDraft(prev => ({ ...prev, [p.id]: e.target.value }))}
                    />
                    <button type="button" className="button secondary small" disabled={busyId === p.id} onClick={() => onSaveNotes(p.id)}>
                      Save note
                    </button>
                  </div>

                  {fb && (
                    <div className={'adm-fb ' + (fb.ok ? 'ok' : 'err')}>
                      <span>{fb.text}</span>
                      {fb.creds && (
                        <div className="adm-creds">
                          <pre>{fb.creds}</pre>
                          <button type="button" className="button secondary small" onClick={() => copyCreds(p.id, fb.creds!)}>
                            {copiedId === p.id ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy login</>}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </article>;
          })}
        </div>
      )}
    </section>
  </main>;
}
