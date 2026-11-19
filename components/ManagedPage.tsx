import Link from '@/components/SiteLink';
import { ArrowUpRight, Check } from 'lucide-react';
import Banner from '@/components/v/Banner';
import EnquiryForm from '@/components/EnquiryForm';
import CourseListing from '@/components/CourseListing';
import BrandCard from '@/components/BrandCard';
import { getPageContent } from '@/lib/cms/server';
import type { PageKey } from '@/lib/cms/schema';
import { configured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import type { Project } from '@/lib/types';
const labels={courses:'Courses','podcast-studio':'Podcast Studio',production:'Production',projects:'Student Work',careers:'Careers'};
export default async function ManagedPage({page}:{page:PageKey}){
  const doc=await getPageContent(page);
  const courseDoc=page==='courses'?doc:await getPageContent('courses');
  const courseOptions=courseDoc.sections.flatMap(s=>s.items.map(i=>i.title));
  let projects:Project[]=[];
  if(page==='projects'&&configured){const db=await createClient();const {data,error}=await db.from('projects').select('*').eq('status','published').order('created_at',{ascending:false});if(error)throw new Error('Unable to load student work.');projects=data??[];}
  return <main className="v-page managed-page"><Banner crumb={labels[page]} eyebrow={doc.banner.eyebrow} title={doc.banner.title} italic={doc.banner.italic} lede={doc.banner.description} image={doc.banner.image||'/images/academy-filmmaking.webp'} imageAlt={doc.banner.image_alt}>{doc.banner.button_label&&doc.banner.button_link&&<Link className="v-pill-sun" href={doc.banner.button_link}>{doc.banner.button_label}<ArrowUpRight size={15}/></Link>}</Banner>
    {page==='courses'?<CourseListing sections={doc.sections}/>:doc.sections.map((section,si)=><section className="v-sec bg-paper" key={si}><div className="v-wrap"><header className="v-head center"><p className="v-eyebrow">{section.eyebrow}</p><h2>{section.title}</h2>{section.description&&<p className="v-lead">{section.description}</p>}</header><div className="cms-public-grid">{section.items.map((item,i)=><article id={item.slug || undefined} className="cms-public-card" key={i}>{item.image&&<img src={item.image} alt={item.title} loading="lazy"/>}<div className="cms-public-copy"><span className="v-eyebrow">{String(i+1).padStart(2,'0')}</span><h3>{item.title}</h3>{item.description&&<p>{item.description}</p>}{item.details.length>0&&<ul>{item.details.filter(Boolean).map((d,j)=><li key={j}><Check size={14}/>{d}</li>)}</ul>}{item.href&&<Link href={item.href} className="v-pill-dark">Find out more<ArrowUpRight size={15}/></Link>}</div></article>)}</div></div></section>)}
    {page==='projects'&&<section className="v-sec bg-paper" id="showcase"><div className="v-wrap"><header className="v-head center"><p className="v-eyebrow">Student showcase</p><h2>Work by our students.</h2></header>{projects.length?<div className="project-grid">{projects.map(p=><Link key={p.id} href={'/projects/'+p.id}><BrandCard project={p}/></Link>)}</div>:<div className="v-empty"><h3>Student work coming soon.</h3><p>Approved, published student projects will appear here.</p></div>}</div></section>}
    {doc.enquiry.enabled&&<section className="home-admissions" id="enquire"><div className="v-wrap"><header className="home-admissions-heading"><p className="v-eyebrow">Get in touch</p><h2>{doc.enquiry.title}</h2><p>{doc.enquiry.description}</p></header><div className="home-admissions-form cms-public-enquiry"><EnquiryForm courseOptions={courseOptions} type={page==='podcast-studio'?'studio':page==='production'?'production':'admission'} /></div></div></section>}
  </main>;
}
