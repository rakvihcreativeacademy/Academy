'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Link from '@/components/SiteLink';
import { saveContent, uploadContentImage } from '@/actions/content';
import { defaultContent } from '@/lib/cms/defaults';
import { pageKeys, resolveCourseStatus, isCourseEnabled, type PageKey, type PageContent, type ContentRecord, type CourseStatus } from '@/lib/cms/schema';
const names:Record<PageKey,string>={courses:'Courses','podcast-studio':'Podcast Studio',production:'Production',projects:'Student Work',careers:'Careers'};
const emptyItem={slug:'',title:'New item',description:'',image:'',details:[] as string[],href:'',status:'upcoming' as CourseStatus,enabled:true};
function Field({label,value,onChange,multiline=false}:{label:string;value:string;onChange:(v:string)=>void;multiline?:boolean}) {return <label>{label}{multiline?<textarea rows={3} value={value} onChange={e=>onChange(e.target.value)} />:<input value={value} onChange={e=>onChange(e.target.value)} />}</label>;}
function ImageField({value,onChange,disabled,onBusy}:{value:string;onChange:(v:string)=>void;disabled:boolean;onBusy?:(busy:boolean)=>void}) {
  const [busy,setBusy]=useState(false);
  return <div className="cms-image-field"><Field label="Image path or HTTPS URL" value={value} onChange={onChange}/>{value&&<img src={value} alt="Selected content preview" />}<label className="cms-upload">{busy?'Uploading…':'Upload JPG, PNG or WEBP · max 5 MB'}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled||busy} onChange={async e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>5242880||!['image/jpeg','image/png','image/webp'].includes(file.type)){toast.error('Use JPG, PNG or WEBP up to 5 MB.');return;}setBusy(true);onBusy?.(true);try{const f=new FormData();f.set('file',file);const r=await uploadContentImage(f);if(r.ok)onChange(r.url);else toast.error(r.error);}catch{toast.error('Upload failed. Please retry.');}finally{setBusy(false);onBusy?.(false);e.target.value='';}}}/></label></div>;
}
export default function ContentEditor({records,connected,initialPage='courses',embedded=false}:{records:ContentRecord[];connected:boolean;initialPage?:PageKey;embedded?:boolean}) {
  const [key,setKey]=useState<PageKey>(initialPage);
  const [drafts,setDrafts]=useState<Record<PageKey,PageContent>>(()=>Object.fromEntries(pageKeys.map(k=>[k,records.find(r=>r.key===k)?.draft??defaultContent[k]])) as Record<PageKey,PageContent>);
  const [revisions,setRevisions]=useState(()=>Object.fromEntries(pageKeys.map(k=>[k,records.find(r=>r.key===k)?.revision??0])));
  const [dirty,setDirty]=useState<Partial<Record<PageKey,boolean>>>({});
  const [busy,setBusy]=useState(false);
  const [uploadCount,setUploadCount]=useState(0);
  const onUploadBusy=(value:boolean)=>setUploadCount(count=>Math.max(0,count+(value?1:-1)));
  const [status,setStatus]=useState('');
  const doc=drafts[key];
  useEffect(()=>{if(!Object.values(dirty).some(Boolean))return;const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue='';};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
  function change(fn:(d:PageContent)=>void){setDrafts(prev=>{const next=structuredClone(prev);fn(next[key]);return next;});setDirty(d=>({...d,[key]:true}));setStatus('Unsaved changes');}
  async function save(publish:boolean){setBusy(true);try{const r=await saveContent(key,doc,revisions[key],publish);if(!r.ok){toast.error(r.error);return;}setRevisions(v=>({...v,[key]:r.revision}));setDirty(d=>({...d,[key]:false}));setStatus(publish?'Published to the website':'Draft saved — website unchanged');toast.success(publish?'Page published':'Draft saved');}catch{toast.error('The connection was interrupted. Reload to check the saved draft before retrying.');}finally{setBusy(false);}}

  const courseEntries = key === 'courses'
    ? doc.sections.flatMap((sec, si) => sec.items.map((it, ii) => ({
        si, ii, item: it,
        courseStatus: resolveCourseStatus(it),
        enabled: isCourseEnabled(it),
      })))
    : [];
  const liveCount = courseEntries.filter(c => c.enabled && c.courseStatus === 'live').length;
  const upcomingCount = courseEntries.filter(c => c.enabled && c.courseStatus === 'upcoming').length;
  const offCount = courseEntries.filter(c => !c.enabled).length;

  return <div className={embedded?"cms-layout cms-embedded":"cms-layout"}>{!embedded&&<aside className="cms-sidebar"><p className="v-eyebrow">WEBSITE MANAGER</p><h1>Make it<br /><em>your own.</em></h1><nav aria-label="Content pages">{pageKeys.map(k=><button key={k} type="button" className={key===k?'active':''} onClick={()=>{setKey(k);setStatus('');}}>{names[k]}{dirty[k]?' •':''}</button>)}</nav><Link href="/admin">← Enquiries & projects</Link><Link href="/admin/projects/new">+ Add student work</Link><p>Drafts stay private. Publish when your page is ready.</p></aside>}<div className="cms-editor"><header className="cms-toolbar"><div><span className="v-eyebrow">WEBSITE CONTENT</span><h1>{names[key]}</h1><p role="status">{uploadCount?'Uploading image…':status||'Add content and photos, save a draft, then publish to your website.'}</p></div><div><Link href={'/'+key} target="_blank" rel="noopener noreferrer">View page ↗</Link><button className="button secondary" disabled={busy||uploadCount>0||!connected} onClick={()=>save(false)}>Save draft</button><button className="button" disabled={busy||uploadCount>0||!connected} onClick={()=>save(true)}>{busy?'Saving…':'Publish page'}</button></div></header>{!connected&&<p className="notice">Setup preview: add credentials to .env.local and run supabase/SETUP_ALL.sql to enable saving and uploads. You can explore the editor now.</p>}
    <fieldset disabled={busy}>
    {key === 'courses' && courseEntries.length > 0 && (
      <section className="cms-course-board" aria-label="Course live, upcoming and visibility controls">
        <div className="cms-course-board-head">
          <div>
            <h2>Course Status &amp; Visibility</h2>
            <p>Choose which courses are <strong>Live</strong> (featured on the home page &amp; open for applications), <strong>Upcoming</strong>, or turned <strong>Off</strong> (hidden from the site).</p>
          </div>
          <div className="cms-course-stats">
            <span className="cms-pill-stat is-live"><i></i>{liveCount} Live</span>
            <span className="cms-pill-stat is-upcoming">{upcomingCount} Upcoming</span>
            <span className="cms-pill-stat is-off">{offCount} Off</span>
          </div>
        </div>
        <div className="cms-course-list">
          {courseEntries.map(({ si, ii, item, courseStatus, enabled }) => (
            <div key={`${si}-${ii}`} className={'cms-course-row' + (!enabled ? ' is-off' : courseStatus === 'live' ? ' is-live' : '')}>
              <div className="cms-course-info">
                {item.image && <img src={item.image} alt="" />}
                <div>
                  <strong>{item.title || 'Untitled course'}</strong>
                  <small>{enabled ? (courseStatus === 'live' ? 'Live · Shown on homepage Apply card & Courses' : 'Upcoming · Shown as Coming soon') : 'Off · Hidden from website'}</small>
                </div>
              </div>
              <div className="cms-course-actions">
                <div className="cms-seg" role="group" aria-label={`Status for ${item.title}`}>
                  <button
                    type="button"
                    className={courseStatus === 'live' ? 'on live' : ''}
                    disabled={!enabled}
                    onClick={() => change(d => { d.sections[si].items[ii].status = 'live'; })}
                  >Live</button>
                  <button
                    type="button"
                    className={courseStatus === 'upcoming' ? 'on upcoming' : ''}
                    disabled={!enabled}
                    onClick={() => change(d => { d.sections[si].items[ii].status = 'upcoming'; })}
                  >Upcoming</button>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  className={'cms-switch' + (enabled ? ' on' : '')}
                  onClick={() => change(d => { d.sections[si].items[ii].enabled = !enabled; })}
                >
                  <span className="cms-switch-track"><span className="cms-switch-thumb" /></span>
                  <span>{enabled ? 'On' : 'Off'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        {dirty[key] && (
          <div className="cms-course-board-foot">
            <span>You have unpublished course status changes.</span>
            <button type="button" className="button" disabled={busy || uploadCount > 0 || !connected} onClick={() => save(true)}>
              {busy ? 'Publishing…' : 'Publish changes to website'}
            </button>
          </div>
        )}
      </section>
    )}
    <details className="cms-block"><summary>Page banner — heading, image &amp; buttons</summary><div className="cms-fields">{(['eyebrow','title','italic','description','image_alt','button_label','button_link'] as const).map(f=><Field key={f} label={f.replaceAll('_',' ')} value={doc.banner[f]} multiline={f==='description'} onChange={v=>change(d=>{d.banner[f]=v;})}/>)}<ImageField onBusy={onUploadBusy} value={doc.banner.image} disabled={!connected} onChange={v=>change(d=>{d.banner.image=v;})}/></div></details>
    {doc.sections.map((section,si)=><details className="cms-block" key={key+'-'+si} open={si===0 && key!=='courses'}><summary>{String(si+2).padStart(2,'0')} — {section.title||'Content section'}</summary><div className="cms-fields">{(['eyebrow','title','description'] as const).map(f=><Field key={f} label={f} value={section[f]} multiline={f==='description'} onChange={v=>change(d=>{d.sections[si][f]=v;})}/>)}<div className="cms-inline-actions"><button type="button" disabled={si===0} onClick={()=>change(d=>{[d.sections[si-1],d.sections[si]]=[d.sections[si],d.sections[si-1]];})}>Move section up</button><button type="button" onClick={()=>{if(confirm('Remove this section from the draft? Publish to apply this change.'))change(d=>{d.sections.splice(si,1);});}}>Remove section</button></div>
    {section.items.map((item,ii)=>{
      const cStatus = resolveCourseStatus(item);
      const cOn = isCourseEnabled(item);
      return <details className="cms-item" key={key+'-'+si+'-'+ii}><summary>{item.image&&<img src={item.image} alt=""/>}<span>{ii+1}. {item.title||'Untitled item'}</span>{key==='courses'&&<span className={'cms-tag ' + (!cOn ? 'off' : cStatus)}>{!cOn ? 'Off' : cStatus === 'live' ? 'Live' : 'Upcoming'}</span>}</summary><div className="cms-fields"><Field label="Anchor / slug (lowercase letters, numbers, hyphens)" value={item.slug??''} onChange={v=>change(d=>{d.sections[si].items[ii].slug=v;})}/>{key==='courses'&&<div className="cms-item-status-row"><label>Course status<select value={cStatus} onChange={e=>change(d=>{d.sections[si].items[ii].status=e.target.value as CourseStatus;})}><option value="live">Live (Open for applications)</option><option value="upcoming">Upcoming (Coming soon)</option></select></label><label className="cms-checkbox"><input type="checkbox" checked={cOn} onChange={e=>change(d=>{d.sections[si].items[ii].enabled=e.target.checked;})}/>Visible on website (On / Off)</label></div>}<Field label="Title" value={item.title} onChange={v=>change(d=>{d.sections[si].items[ii].title=v;})}/><Field label="Description" multiline value={item.description} onChange={v=>change(d=>{d.sections[si].items[ii].description=v;})}/><Field label="Details / modules (one per line)" multiline value={item.details.join('\n')} onChange={v=>change(d=>{d.sections[si].items[ii].details=v.split('\n');})}/><Field label="Link (local path, #anchor or HTTPS)" value={item.href} onChange={v=>change(d=>{d.sections[si].items[ii].href=v;})}/><ImageField onBusy={onUploadBusy} value={item.image} disabled={!connected} onChange={v=>change(d=>{d.sections[si].items[ii].image=v;})}/><div className="cms-inline-actions"><button type="button" disabled={ii===0} onClick={()=>change(d=>{const list=d.sections[si].items;[list[ii-1],list[ii]]=[list[ii],list[ii-1]];})}>Move up</button><button type="button" onClick={()=>{if(confirm('Remove this item from the draft?'))change(d=>{d.sections[si].items.splice(ii,1);});}}>Remove item</button></div></div></details>;
    })}<button type="button" className="button secondary" onClick={()=>change(d=>{d.sections[si].items.push(structuredClone(emptyItem));})}>+ Add {key==='courses'?'course':key==='careers'?'career opportunity':key==='podcast-studio'?'studio item':key==='production'?'production service':'showcase item'}</button></div></details>)}
    <button type="button" className="button secondary" onClick={()=>change(d=>{d.sections.push({eyebrow:'',title:'New section',description:'',items:[]});})}>+ Add section</button>
    <details className="cms-block"><summary>Enquiry section</summary><div className="cms-fields"><label className="cms-checkbox"><input type="checkbox" checked={doc.enquiry.enabled} onChange={e=>change(d=>{d.enquiry.enabled=e.target.checked;})}/>Show enquiry form</label><Field label="Title" value={doc.enquiry.title} onChange={v=>change(d=>{d.enquiry.title=v;})}/><Field label="Description" multiline value={doc.enquiry.description} onChange={v=>change(d=>{d.enquiry.description=v;})}/></div></details>
    </fieldset></div></div>;
}
