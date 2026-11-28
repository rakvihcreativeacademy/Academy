'use client';
import { useMemo, useState } from 'react';
import {
  AlertCircle, CheckCircle2, Clock, Eye, FileText, GraduationCap,
  Mail, MapPin, Phone, RotateCcw, Search, ShieldCheck, UserCheck, Users, X,
} from 'lucide-react';
import { formatAadhaar, formatInr, type CoursePayment } from '@/lib/payments';
import { getAadhaarSignedUrl } from '@/actions/payments';

type Scope = 'approved' | 'all' | 'pending';

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('') || 'S';
}

export default function AdminStudents({
  initialStudents,
  setupNeeded,
}: {
  initialStudents: CoursePayment[];
  setupNeeded: boolean;
}) {
  const [scope, setScope] = useState<Scope>('approved');
  const [query, setQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [selected, setSelected] = useState<CoursePayment | null>(null);
  const [openingDoc, setOpeningDoc] = useState(false);
  const [docError, setDocError] = useState('');

  const approvedCount = useMemo(() => initialStudents.filter(s => s.approval_status === 'approved').length, [initialStudents]);
  const pendingCount = useMemo(() => initialStudents.filter(s => (s.approval_status ?? 'pending') === 'pending').length, [initialStudents]);
  const paidCount = useMemo(() => initialStudents.filter(s => s.status === 'paid').length, [initialStudents]);

  const coursesList = useMemo(
    () => Array.from(new Set(initialStudents.map(s => s.course_title).filter(Boolean))),
    [initialStudents],
  );
  const modesList = useMemo(
    () => Array.from(new Set(initialStudents.map(s => s.learning_mode).filter((v): v is string => Boolean(v)))),
    [initialStudents],
  );

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    return initialStudents.filter(s => {
      const app = s.approval_status ?? 'pending';
      if (scope === 'approved' && app !== 'approved') return false;
      if (scope === 'pending' && app !== 'pending') return false;
      if (courseFilter !== 'all' && s.course_title !== courseFilter) return false;
      if (modeFilter !== 'all' && (s.learning_mode || '') !== modeFilter) return false;
      if (paymentFilter === 'paid' && s.status !== 'paid') return false;
      if (paymentFilter === 'unpaid' && s.status === 'paid') return false;
      if (!q) return true;
      return [
        s.student_name,
        s.student_email,
        s.student_phone,
        s.course_title,
        s.city ?? '',
        s.state ?? '',
        s.learning_mode ?? '',
        s.aadhaar_number ?? '',
      ].join(' ').toLowerCase().includes(q);
    });
  }, [initialStudents, scope, courseFilter, modeFilter, paymentFilter, q]);

  const hasFilters = Boolean(q || courseFilter !== 'all' || modeFilter !== 'all' || paymentFilter !== 'all');
  const resetFilters = () => {
    setQuery('');
    setCourseFilter('all');
    setModeFilter('all');
    setPaymentFilter('all');
  };

  const openAadhaar = async (docPath: string) => {
    setOpeningDoc(true);
    setDocError('');
    const res = await getAadhaarSignedUrl(docPath);
    setOpeningDoc(false);
    if (res.ok) {
      window.open(res.url, '_blank', 'noopener,noreferrer');
    } else {
      setDocError(res.error);
    }
  };

  return (
    <main className="admin-overview">
      <header className="overview-heading">
        <div>
          <span className="overview-breadcrumb">WORKSPACE / STUDENTS</span>
          <h1>Students</h1>
          <p>View all enrolled students, filter by course or batch mode, and click the eye icon to inspect full student &amp; KYC details.</p>
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
          <div><span>Enrolled students</span><UserCheck size={17} /></div>
          <strong>{approvedCount}</strong>
          <p>Approved with portal access</p>
        </article>
        <article>
          <div><span>Pending approval</span><Clock size={17} /></div>
          <strong>{pendingCount}</strong>
          <p>Awaiting review in Registrations</p>
        </article>
        <article>
          <div><span>Paid registrations</span><CheckCircle2 size={17} /></div>
          <strong>{paidCount}</strong>
          <p>Verified Razorpay payments</p>
        </article>
        <article>
          <div><span>Total records</span><Users size={17} /></div>
          <strong>{initialStudents.length}</strong>
          <p>Across {coursesList.length || 1} {coursesList.length === 1 ? 'course' : 'courses'}</p>
        </article>
      </div>

      <section className="overview-content-panel adm-table-panel">
        <div className="adm-mini-bar">
          <div className="adm-mini-title">
            <strong>{scope === 'approved' ? 'Enrolled Students' : scope === 'pending' ? 'Pending Review' : 'All Applicants'}</strong>
            <span>{filtered.length}</span>
          </div>

          <div className="adm-mini-controls">
            <label className="adm-mini-search">
              <Search size={14} />
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search student…"
              />
              {query && (
                <button type="button" aria-label="Clear search" onClick={() => setQuery('')}>
                  <X size={13} />
                </button>
              )}
            </label>

            <select aria-label="Student view" value={scope} onChange={e => setScope(e.target.value as Scope)}>
              <option value="approved">Enrolled ({approvedCount})</option>
              <option value="all">All ({initialStudents.length})</option>
              <option value="pending">Pending ({pendingCount})</option>
            </select>

            {coursesList.length > 1 && (
              <select aria-label="Course" value={courseFilter} onChange={e => setCourseFilter(e.target.value)}>
                <option value="all">All courses</option>
                {coursesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}

            {modesList.length > 1 && (
              <select aria-label="Batch mode" value={modeFilter} onChange={e => setModeFilter(e.target.value)}>
                <option value="all">All batches</option>
                {modesList.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            )}

            <select aria-label="Payment" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value as 'all' | 'paid' | 'unpaid')}>
              <option value="all">All payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>

            {hasFilters && (
              <button type="button" className="adm-mini-reset" title="Reset filters" aria-label="Reset filters" onClick={resetFilters}>
                <RotateCcw size={13} />
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="adm-empty-box">
            <GraduationCap size={28} />
            <p>
              {scope === 'approved' && approvedCount === 0 && initialStudents.length > 0
                ? 'No approved students yet. Approve a registration in Course Registrations or switch to "All Applicants".'
                : 'No students match the selected filters.'}
            </p>
            {hasFilters && (
              <button type="button" className="button secondary small" onClick={resetFilters}>Reset filters</button>
            )}
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course &amp; Batch</th>
                  <th>Phone &amp; City</th>
                  <th>Payment</th>
                  <th>Portal Status</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>View</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => {
                  const app = s.approval_status ?? 'pending';
                  const paid = s.status === 'paid';
                  const dateVal = s.approved_at || s.paid_at || s.created_at;
                  return (
                    <tr key={s.id}>
                      <td>
                        <div className="adm-student-cell">
                          <span className="adm-avatar">{initials(s.student_name)}</span>
                          <div>
                            <strong>{s.student_name}</strong>
                            <small>{s.student_email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="adm-course-cell">
                          <strong>{s.course_title}</strong>
                          <small>{s.learning_mode || 'Standard batch'}</small>
                        </div>
                      </td>
                      <td>
                        <div className="adm-course-cell">
                          <strong>{s.student_phone}</strong>
                          <small>{[s.city, s.state].filter(Boolean).join(', ') || '—'}</small>
                        </div>
                      </td>
                      <td>
                        <span className={'adm-badge ' + (paid ? 'green' : s.status === 'failed' ? 'red' : 'amber')}>
                          {paid ? `Paid · ${formatInr(Math.round(s.amount_paise / 100))}` : s.status === 'failed' ? 'Failed' : s.status === 'refunded' ? 'Refunded' : 'Not paid'}
                        </span>
                      </td>
                      <td>
                        <span className={'adm-badge ' + (app === 'approved' ? 'green' : app === 'rejected' ? 'red' : 'amber')}>
                          {app === 'approved' ? 'Active Login' : app === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                      </td>
                      <td className="adm-date-cell">
                        {new Date(dateVal).toLocaleDateString('en-IN', { days: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="adm-eye-btn"
                          title={`View ${s.student_name}'s full profile`}
                          aria-label={`View ${s.student_name}'s full profile`}
                          onClick={() => { setDocError(''); setSelected(s); }}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && (
        <div
          className="adm-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-modal-title"
          onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}
        >
          <div className="adm-modal">
            <header className="adm-modal-head">
              <div className="adm-student-cell">
                <span className="adm-avatar lg">{initials(selected.student_name)}</span>
                <div>
                  <h2 id="student-modal-title">{selected.student_name}</h2>
                  <p>{selected.course_title} · {selected.learning_mode || 'Standard batch'}</p>
                </div>
              </div>
              <button type="button" className="adm-modal-close" aria-label="Close student profile" onClick={() => setSelected(null)}>
                <X size={18} />
              </button>
            </header>

            <div className="adm-modal-badges">
              <span className={'adm-badge ' + (selected.status === 'paid' ? 'green' : 'amber')}>
                {selected.status === 'paid' ? `Paid ${formatInr(Math.round(selected.amount_paise / 100))}` : `Payment: ${selected.status}`}
              </span>
              <span className={'adm-badge ' + (selected.approval_status === 'approved' ? 'green' : selected.approval_status === 'rejected' ? 'red' : 'amber')}>
                {selected.approval_status === 'approved' ? 'Portal Account Active' : selected.approval_status === 'rejected' ? 'Rejected' : 'Pending Approval'}
              </span>
              <div className="adm-modal-quick">
                <a href={`tel:${selected.student_phone}`} className="adm-quick-link"><Phone size={13} /> Call</a>
                <a href={`mailto:${selected.student_email}`} className="adm-quick-link"><Mail size={13} /> Email</a>
              </div>
            </div>

            <div className="adm-modal-body">
              <section className="adm-detail-card">
                <h3>Personal &amp; Contact</h3>
                <dl className="adm-detail-grid">
                  <div><dt>Email</dt><dd>{selected.student_email}</dd></div>
                  <div><dt>Phone / WhatsApp</dt><dd>{selected.student_phone}</dd></div>
                  <div><dt>Date of birth</dt><dd>{selected.date_of_birth || '—'}</dd></div>
                  <div><dt>Gender</dt><dd>{selected.gender || '—'}</dd></div>
                  <div className="full"><dt><MapPin size={12} /> Address</dt><dd>{[selected.address, selected.city, selected.state, selected.pincode].filter(Boolean).join(', ') || '—'}</dd></div>
                </dl>
              </section>

              <section className="adm-detail-card">
                <h3>Course &amp; Payment</h3>
                <dl className="adm-detail-grid">
                  <div><dt>Programme</dt><dd>{selected.course_title}</dd></div>
                  <div><dt>Batch mode</dt><dd>{selected.learning_mode || '—'}</dd></div>
                  <div><dt>Fee amount</dt><dd>{formatInr(Math.round(selected.amount_paise / 100))}</dd></div>
                  <div><dt>Applied on</dt><dd>{new Date(selected.created_at).toLocaleString('en-IN')}</dd></div>
                  <div><dt>Razorpay Order ID</dt><dd className="mono">{selected.razorpay_order_id}</dd></div>
                  <div><dt>Payment ID</dt><dd className="mono">{selected.razorpay_payment_id || 'Pending'}</dd></div>
                </dl>
              </section>

              <section className="adm-detail-card">
                <h3>Background &amp; Emergency Contact</h3>
                <dl className="adm-detail-grid">
                  <div><dt>Education</dt><dd>{selected.education || '—'}</dd></div>
                  <div><dt>Occupation</dt><dd>{selected.occupation || '—'}</dd></div>
                  <div><dt>Experience level</dt><dd>{selected.experience_level || '—'}</dd></div>
                  <div><dt>Emergency contact</dt><dd>{selected.emergency_contact_name ? `${selected.emergency_contact_name} (${selected.emergency_contact_phone || '—'})` : '—'}</dd></div>
                  {selected.goals && <div className="full"><dt>Creative goals</dt><dd>{selected.goals}</dd></div>}
                </dl>
              </section>

              <section className="adm-detail-card">
                <div className="adm-kyc-row">
                  <div>
                    <h3><ShieldCheck size={14} /> Aadhaar KYC</h3>
                    <p className="adm-kyc-num">{formatAadhaar(selected.aadhaar_number)}</p>
                    {selected.aadhaar_doc_name && <small>{selected.aadhaar_doc_name}</small>}
                  </div>
                  {selected.aadhaar_doc_path ? (
                    <button
                      type="button"
                      className="button secondary small"
                      disabled={openingDoc}
                      onClick={() => openAadhaar(selected.aadhaar_doc_path!)}
                    >
                      <FileText size={14} /> {openingDoc ? 'Opening…' : 'View Aadhaar Card'}
                    </button>
                  ) : (
                    <small>No document uploaded</small>
                  )}
                </div>
                {docError && <p className="field-error" style={{ marginTop: 8, fontSize: 13 }}>{docError}</p>}
              </section>

              {selected.notes && (
                <section className="adm-detail-card">
                  <h3>Admin Notes</h3>
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55 }}>{selected.notes}</p>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
