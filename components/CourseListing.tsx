'use client';
import { useState } from 'react';
import { Search, ArrowUpRight, Check, ChevronDown, BookOpen, X } from 'lucide-react';
import Link from '@/components/SiteLink';
import type { PageContent } from '@/lib/cms/schema';

export default function CourseListing({sections}:{sections:PageContent['sections']}) {
  const [query,setQuery]=useState('');
  const [open,setOpen]=useState<string[]>([]);
  const total=sections.reduce((n,s)=>n+s.items.length,0);
  const filtered=sections.map(section=>({...section,items:section.items.filter(item=>[item.title,item.description,...item.details].join(' ').toLowerCase().includes(query.trim().toLowerCase()))}));
  const shown=filtered.reduce((n,s)=>n+s.items.length,0);
  return <section className="academy-catalogue" id="course-list"><div className="v-wrap">
    <div className="catalogue-toolbar"><div><p className="v-eyebrow">FIND YOUR CREATIVE DIRECTION</p><h2>Find what moves you.</h2><p>Explore the courses. Discover the tools. Choose your next chapter.</p></div><div className="catalogue-search-group"><label className="catalogue-search"><Search size={18}/><input type="search" aria-label="Search courses" placeholder="Search a course or skill…" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button type="button" aria-label="Clear search" onClick={()=>setQuery('')}><X size={16}/></button>}</label><span role="status">{query?`${shown} of ${total}`:total} {shown===1?'course':'courses'} to explore</span></div></div>
    {filtered.map((section,si)=>section.items.length>0&&<div className="catalogue-section" key={si}><header className="catalogue-section-head"><p className="v-eyebrow">{section.eyebrow}</p><h3>{section.title}</h3>{section.description&&<p>{section.description}</p>}</header><div className="catalogue-grid">{section.items.map((item,i)=>{
      const id=item.slug||`course-${si}-${i}`;
      const expanded=open.includes(id);
      const details=item.details.filter(Boolean);
      return <article id={id} className="catalogue-card" key={id}><div className="catalogue-photo">{item.image?<img src={item.image} alt={item.title} loading="lazy"/>:<div className="catalogue-photo-fallback"><BookOpen size={52} strokeWidth={1}/></div>}<span className="catalogue-number">{String(i+1).padStart(2,'0')}<span>RAKVIH / PROGRAMME</span></span></div><div className="catalogue-card-body"><h3>{item.title}</h3>{item.description&&<p>{item.description}</p>}{details.length>0&&<><div className="catalogue-skills">{details.slice(0,3).map((skill,j)=><span key={j}>{skill}</span>)}{details.length>3&&<span>+{details.length-3} more</span>}</div><button type="button" className="catalogue-curriculum" aria-expanded={expanded} aria-controls={`${id}-curriculum`} onClick={()=>setOpen(prev=>expanded?prev.filter(x=>x!==id):[...prev,id])}><span><BookOpen size={16}/>What you’ll learn</span><ChevronDown size={17} className={expanded?'expanded':''}/></button><ul className="catalogue-module-list" id={`${id}-curriculum`} hidden={!expanded}>{details.map((detail,j)=><li key={j}><Check size={14}/>{detail}</li>)}</ul></>}<div className="catalogue-card-bottom"><span>Turn curiosity<br /><strong>into creative skills.</strong></span><Link href={item.href||`/admissions?course=${encodeURIComponent(item.title)}`} className="catalogue-cta">Enquire now<ArrowUpRight size={17}/></Link></div></div></article>;
    })}</div></div>)}
    {shown===0&&<div className="catalogue-empty"><Search size={28}/><h3>No courses found.</h3><p>Try a different course name, creative skill or software.</p><button type="button" className="v-pill-dark" onClick={()=>setQuery('')}>View all courses</button></div>}
  </div></section>;
}
