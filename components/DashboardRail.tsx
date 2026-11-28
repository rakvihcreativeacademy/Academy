import Link from '@/components/SiteLink';
import {ArrowUpRight,Check,Inbox,FolderPlus,Globe,Database,Sparkles} from 'lucide-react';

type RailPage={key:string;title:string;state:'live'|'changed'|'draft'|'empty'};
type RailEnquiry={id:string;name:string;interest:string;type:string;created_at:string};

const typeLabel:Record<string,string>={admission:'Admission',studio:'Studio',production:'Production'};
const stateLabel:Record<RailPage['state'],string>={live:'Live',changed:'Unpublished edits',draft:'Draft',empty:'Not started'};

function ago(iso:string){
 const diff=(new Date(iso).getTime()-Date.now())/1000;const rtf=new Intl.RelativeTimeFormat('en',{numeric:'auto'});
 const units:[Intl.RelativeTimeFormatUnit,number][]=[['year',31536000],['month',2592000],['week',604800],['days',86400],['hour',3600],['minute',60]];
 for(const [unit,s] of units)if(Math.abs(diff)>=s)return rtf.format(Math.round(diff/s),unit);
 return 'just now';
}
const initials=(name:string)=>name.trim().split(/\s+/).slice(0,2).map(p=>p[0]?.toUpperCase()).join('');

export default function DashboardRail({pages,enquiries,enquiriesFailed}:{pages:RailPage[];enquiries:RailEnquiry[];enquiriesFailed:boolean}){
 const live=pages.filter(p=>p.state==='live').length;const total=pages.length;const pct=total?live/total:0;
 const r=30;const c=2*Math.PI*r;
 const next=pages.find(p=>p.state!=='live');
 return <aside className="rail" aria-label="Workspace summary">
  <section className="rail-launch">
   <header>
    <div className="rail-ring" role="img" aria-label={`${live} of ${total} pages live`}>
     <svg viewBox="0 0 72 72"><circle cx="36" cy="36" r={r} className="rail-ring-track"/><circle cx="36" cy="36" r={r} className="rail-ring-value" strokeDasharray={c} strokeDashoffset={c*(1-pct)}/></svg>
     <span><strong>{live}</strong>/{total}</span>
    </div>
    <div><span className="rail-kicker"><Sparkles size={12}/>Website launch</span><h2>{live===total?'Every page is live.':live===0?'Make it yours.':'Nicely underway.'}</h2></div>
   </header>
   <ol className="rail-checklist">{pages.map(p=><li key={p.key} className={'is-'+p.state}><Link href={'/admin/content?page='+p.key}><i>{p.state==='live'&&<Check size={11} strokeWidth={3}/>}</i><span>{p.title}</span><small>{stateLabel[p.state]}</small></Link></li>)}</ol>
   {next?<Link className="rail-launch-cta" href={'/admin/content?page='+next.key}>Continue with {next.title}<ArrowUpRight size={16}/></Link>:<Link className="rail-launch-cta" href="/" target="_blank" rel="noopener noreferrer">See your live website<ArrowUpRight size={16}/></Link>}
  </section>

  <section className="rail-card">
   <header><h2>Latest enquiries</h2><Link href="/admin/enquiries">View all</Link></header>
   {enquiriesFailed?<p className="rail-empty">Enquiries couldn’t be loaded. Check <Link href="/admin/setup">database setup</Link>.</p>
   :enquiries.length===0?<div className="rail-empty"><span><Inbox size={18}/></span><p>No enquiries yet. New messages from your website forms will appear here.</p></div>
   :<ul className="rail-enquiries">{enquiries.map(e=><li key={e.id}><Link href="/admin/enquiries"><span className="rail-avatar" aria-hidden="true">{initials(e.name)}</span><span className="rail-enquiry-text"><strong>{e.name}</strong><small>{e.interest}</small></span><span className="rail-enquiry-meta"><em className={'t-'+e.type}>{typeLabel[e.type]??e.type}</em><time dateTime={e.created_at}>{ago(e.created_at)}</time></span></Link></li>)}</ul>}
  </section>

  <section className="rail-card">
   <header><h2>Quick actions</h2></header>
   <div className="rail-tiles">
    <Link href="/admin/projects/new"><FolderPlus size={18}/><strong>Add work</strong><small>Student project</small></Link>
    <Link href="/admin/enquiries"><Inbox size={18}/><strong>Enquiries</strong><small>Follow up</small></Link>
    <Link href="/" target="_blank" rel="noopener noreferrer"><Globe size={18}/><strong>View site</strong><small>Opens new tab</small></Link>
    <Link href="/admin/setup"><Database size={18}/><strong>Database</strong><small>Setup & SQL</small></Link>
   </div>
  </section>
 </aside>;
}
