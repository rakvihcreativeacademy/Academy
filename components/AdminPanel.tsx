"use client";
import { useMemo, useState, useTransition } from 'react';
import Link from '@/components/SiteLink';
import { toast } from 'sonner';
import {
  Inbox, Sparkles, CalendarDays, GraduationCap, Mic, Clapperboard, FolderOpen, Search, Download, Phone, Mail,
  MessageCircle, Trash2, ChevronDown, ExternalLink, LogOut, LayoutDashboard,
} from 'lucide-react';
import type { Project } from '@/lib/types';
import { enquiryTypes, whatsappLink, site, type EnquiryType } from '@/lib/site';
import { updateEnquiry, deleteEnquiry, setProjectStatus, adminDeleteProject } from '@/actions/admin';

export type Enquiry = {
  id: string; name: string; email: string; phone: string; interest: string; preferred: string | null;
  learning_mode: string | null; message: string | null; type: EnquiryType; status: Status; notes: string | null; created_at: string;
};
type Status = 'new' | 'contacted' | 'enrolled' | 'closed';
const statuses: Status[] = ['new', 'contacted', 'enrolled', 'closed'];

const fmt = (d: string) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
/** Indian numbers without a country code get +91 so WhatsApp can open the chat. */
const waNumber = (phone: string) => { const d = phone.replace(/\D/g, ''); return d.length === 10 ? '91' + d : d; };
const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export default function AdminPanel({ email, enquiries, projects, signOut, initialTab='enquiries', embedded=false }: { initialTab?:'enquiries'|'projects'; embedded?:boolean; email: string; enquiries: Enquiry[]; projects: Project[]; signOut: () => Promise<void> }) {
  const [tab, setTab] = useState<'enquiries' | 'projects'>(initialTab);
  const [rows, setRows] = useState(enquiries);
  const [items, setItems] = useState(projects);
  const [q, setQ] = useState('');
  const [type, setType] = useState<'all' | EnquiryType>('all');
  const [status, setStatus] = useState<'all' | Status>('all');
  const [open, setOpen] = useState<string | null>(null);
  const [, start] = useTransition();

  const weekAgo = Date.now() - 7 * 864e5;
  const stats = [
    { icon: Inbox, label: 'Total enquiries', value: rows.length },
    { icon: Sparkles, label: 'New (not contacted)', value: rows.filter(r => r.status === 'new').length, hot: true },
    { icon: CalendarDays, label: 'Last 7 days', value: rows.filter(r => +new Date(r.created_at) > weekAgo).length },
    { icon: GraduationCap, label: 'Enrolled', value: rows.filter(r => r.status === 'enrolled').length },
    { icon: Mic, label: 'Studio bookings', value: rows.filter(r => r.type === 'studio').length },
    { icon: FolderOpen, label: 'Published projects', value: items.filter(p => p.status === 'published').length },
  ];

  const filtered = useMemo(() => rows.filter(r =>
    (type === 'all' || r.type === type) && (status === 'all' || r.status === status) &&
    [r.name, r.email, r.phone, r.interest, r.message].join(' ').toLowerCase().includes(q.toLowerCase())), [rows, type, status, q]);

  function patch(r: Enquiry, change: Partial<Pick<Enquiry, 'status' | 'notes'>>) {
    const before = rows;
    setRows(rs => rs.map(x => x.id === r.id ? { ...x, ...change } : x));
    start(async () => {
      const res = await updateEnquiry(r.id, { status: change.status, notes: change.notes ?? undefined });
      if (!res.ok) { setRows(before); toast.error(res.error); } else toast.success('Saved');
    });
  }
  function remove(r: Enquiry) {
    if (!confirm(`Delete the enquiry from ${r.name}? This cannot be undone.`)) return;
    const before = rows;
    setRows(rs => rs.filter(x => x.id !== r.id));
    start(async () => { const res = await deleteEnquiry(r.id); if (!res.ok) { setRows(before); toast.error(res.error); } else toast.success('Enquiry deleted'); });
  }
  function projectStatus(p: Project, s: string) {
    const before = items;
    setItems(ps => ps.map(x => x.id === p.id ? { ...x, status: s as Project['status'] } : x));
    start(async () => { const res = await setProjectStatus(p.id, s); if (!res.ok) { setItems(before); toast.error(res.error); } else toast.success(s === 'published' ? 'Published on the website' : 'Updated'); });
  }
  function removeProject(p: Project) {
    if (!confirm(`Delete “${p.title}”? This cannot be undone.`)) return;
    const before = items;
    setItems(ps => ps.filter(x => x.id !== p.id));
    start(async () => { const res = await adminDeleteProject(p.id); if (!res.ok) { setItems(before); toast.error(res.error); } else toast.success('Project deleted'); });
  }
  function exportCsv() {
    const head = ['Date', 'Type', 'Status', 'Name', 'Mobile', 'Email', 'Interest', 'Preferred', 'Learning mode', 'Message', 'Notes'];
    const body = filtered.map(r => [fmt(r.created_at), enquiryTypes[r.type], r.status, r.name, r.phone, r.email, r.interest, r.preferred, r.learning_mode, r.message, r.notes].map(csvCell).join(','));
    const blob = new Blob(['﻿' + [head.map(csvCell).join(','), ...body].join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `rakvih-enquiries-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(a.href);
  }

  return <div className={embedded?"admin admin-embedded":"admin"}>
    {!embedded&&<aside className="admin-side">
      <Link href="/" className="admin-brand"><img src="/brand/rakvih-logo-square.png" alt="" /><span>Admin<small>{site.name}</small></span></Link>
      <nav>
        <button className={tab === 'enquiries' ? 'active' : ''} onClick={() => setTab('enquiries')}><Inbox size={18} /> Enquiries <b>{rows.filter(r => r.status === 'new').length || ''}</b></button>
        <button className={tab === 'projects' ? 'active' : ''} onClick={() => setTab('projects')}><FolderOpen size={18} /> Student projects</button>
        <Link href="/dashboard"><LayoutDashboard size={18} /> My projects</Link>
        <Link href="/" target="_blank"><ExternalLink size={18} /> View website</Link>
      </nav>
      <div className="admin-user"><span>{email}</span><form action={signOut}><button title="Sign out"><LogOut size={16} /> Sign out</button></form></div>
    </aside>}

    <section className="admin-body">
      <header className="admin-head">
        <div><p className="eyebrow">Admin panel</p><h1>{tab === 'enquiries' ? 'Student & client enquiries' : 'Student projects'}</h1></div>
        {tab==='projects'&&<Link className="button secondary" href="/admin/projects/new">+ Add student work</Link>}{tab === 'enquiries' && <button className="button secondary small" onClick={exportCsv}><Download size={16} /> Export CSV</button>}
      </header>

      <div className="admin-stats">
        {stats.map(s => <div key={s.label} className={'stat' + (s.hot && s.value ? ' hot' : '')}><s.icon size={20} /><strong>{s.value}</strong><span>{s.label}</span></div>)}
      </div>

      {tab === 'enquiries' ? <>
        <div className="admin-toolbar">
          <label className="search"><Search size={16} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, phone, email, course…" aria-label="Search enquiries" /></label>
          <div className="filter-pills">
            {(['all', ...Object.keys(enquiryTypes)] as ('all' | EnquiryType)[]).map(t =>
              <button key={t} className={type === t ? 'active' : ''} onClick={() => setType(t)}>{t === 'all' ? 'All' : enquiryTypes[t].replace(' enquiry', '')}</button>)}
          </div>
          <select value={status} onChange={e => setStatus(e.target.value as 'all' | Status)} aria-label="Filter by status" className="status-filter">
            <option value="all">All statuses</option>{statuses.map(s => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>

        {filtered.length === 0
          ? <div className="empty-state"><Inbox size={30} /><h3>No enquiries yet</h3><p className="muted">New admission, studio and production enquiries from the website appear here.</p></div>
          : <div className="enq-list">
            {filtered.map(r => <article key={r.id} className={'enq' + (open === r.id ? ' open' : '') + ' s-' + r.status}>
              <div className="enq-row">
                <button className="enq-main" onClick={() => setOpen(open === r.id ? null : r.id)} aria-expanded={open === r.id}>
                  <span className={'type-dot t-' + r.type}>{r.type === 'admission' ? <GraduationCap size={16} /> : r.type === 'studio' ? <Mic size={16} /> : r.type === 'production' ? <Clapperboard size={16} /> : <Inbox size={16} />}</span>
                  <span className="enq-who"><strong>{r.name}</strong><small>{r.phone} · {fmt(r.created_at)}</small></span>
                  <span className="enq-interest">{r.interest}</span>
                  <ChevronDown size={18} className="chev" />
                </button>
                <select value={r.status} onChange={e => patch(r, { status: e.target.value as Status })} className={'status-select st-' + r.status} aria-label={`Status for ${r.name}`}>
                  {statuses.map(s => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                </select>
                <a className="act wa" href={whatsappLink(`Hi ${r.name.split(' ')[0]}, thank you for your enquiry about ${r.interest} at ${site.name}. `, waNumber(r.phone))} target="_blank" rel="noopener noreferrer" title="Reply on WhatsApp"><MessageCircle size={17} /></a>
                <a className="act" href={`tel:${r.phone.replace(/\s/g, '')}`} title="Call"><Phone size={17} /></a>
                <a className="act" href={`mailto:${r.email}`} title="Email"><Mail size={17} /></a>
              </div>
              {open === r.id && <div className="enq-detail">
                <dl>
                  <div><dt>Type</dt><dd>{enquiryTypes[r.type]}</dd></div>
                  <div><dt>Email</dt><dd>{r.email}</dd></div>
                  {r.preferred && <div><dt>Preferred batch / date</dt><dd>{r.preferred}</dd></div>}
                  {r.learning_mode && <div><dt>Learning mode</dt><dd>{r.learning_mode}</dd></div>}
                  {r.message && <div className="wide"><dt>Message</dt><dd>{r.message}</dd></div>}
                </dl>
                <label>Internal notes
                  <textarea defaultValue={r.notes ?? ''} maxLength={2000} rows={2} placeholder="e.g. Called on Monday, wants weekend batch" onBlur={e => e.target.value !== (r.notes ?? '') && patch(r, { notes: e.target.value })} />
                </label>
                <button className="text-link danger-link" onClick={() => remove(r)}><Trash2 size={15} /> Delete enquiry</button>
              </div>}
            </article>)}
          </div>}
      </> : <>
        {items.length === 0
          ? <div className="empty-state"><FolderOpen size={30} /><h3>No student projects yet</h3><p className="muted">Students add projects from the Creator portal. Publish the best ones here.</p></div>
          : <div className="proj-table">
            {items.map(p => <div key={p.id} className="proj-row">
              <span className="proj-logo">{p.logo_url ? <img src={p.logo_url} alt="" /> : p.title.slice(0, 2).toUpperCase()}</span>
              <span className="proj-info"><strong>{p.title}</strong><small>{p.category || 'Uncategorised'} · {fmt(p.created_at)}</small></span>
              <Link href={`/admin/projects/${p.id}`} className="text-link">Edit</Link><select value={p.status} onChange={e => projectStatus(p, e.target.value)} className={'status-select st-' + p.status} aria-label={`Status for ${p.title}`}>
                <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
              </select>
              {p.status === 'published' && <Link className="act" href={'/projects/' + p.id} target="_blank" title="View on website"><ExternalLink size={17} /></Link>}
              <button className="act" onClick={() => removeProject(p)} title="Delete project"><Trash2 size={17} /></button>
            </div>)}
          </div>}
      </>}
    </section>
  </div>;
}
