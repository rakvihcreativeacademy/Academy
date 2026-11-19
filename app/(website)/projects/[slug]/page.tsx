import { notFound } from 'next/navigation';
import { z } from 'zod';
import Link from '@/components/SiteLink';
import ReactMarkdown from 'react-markdown';
import { createClient } from '@/lib/supabase/server';
import { configured } from '@/lib/supabase/config';
export default async function ProjectDetail({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!configured||!z.uuid().safeParse(slug).success)notFound();const db=await createClient();const {data:p,error}=await db.from('projects').select('*').eq('id',slug).eq('status','published').single();if(error||!p)notFound();return <main className="section detail"><Link href="/projects" className="text-link">← Explore student work</Link><div className="detail-heading"><div className="detail-logo">{p.logo_url?<img src={p.logo_url} alt={p.title+' logo'}/>:p.title.slice(0,2).toUpperCase()}</div><p className="eyebrow">{p.category} / MADE AT RAKVIH</p><h1 className="page-title">{p.title}</h1><p className="body-copy">{p.tagline}</p>{p.website_url&&<a href={p.website_url} target="_blank" rel="noopener noreferrer" className="button mt-6">Visit project ↗</a>}</div><div className="markdown"><ReactMarkdown>{p.description||''}</ReactMarkdown></div></main>;}
