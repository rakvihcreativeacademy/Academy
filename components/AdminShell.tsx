'use client';
import {useEffect,useRef,useState} from 'react';
import { LayoutDashboard, GraduationCap, Mic, Clapperboard, FolderOpen, Briefcase, Inbox, ExternalLink, LogOut, Menu, X } from 'lucide-react';
import Link from '@/components/SiteLink';
import {adminSignOut} from '@/actions/auth';
const nav=[
 {label:'Dashboard',href:'/admin',icon:LayoutDashboard},
 {label:'Courses',href:'/admin/content?page=courses',icon:GraduationCap},
 {label:'Podcast Studio',href:'/admin/content?page=podcast-studio',icon:Mic},
 {label:'Production',href:'/admin/content?page=production',icon:Clapperboard},
 {label:'Student Work',href:'/admin/student-work',icon:FolderOpen},
 {label:'Careers',href:'/admin/content?page=careers',icon:Briefcase},
 {label:'Enquiries',href:'/admin/enquiries',icon:Inbox},
];
export default function AdminShell({children,email}:{children:React.ReactNode;email:string}){
 const [open,setOpen]=useState(false);const [current,setCurrent]=useState('');const drawer=useRef<HTMLDialogElement>(null);const trigger=useRef<HTMLButtonElement>(null);
 useEffect(()=>{setCurrent(window.location.pathname+window.location.search);},[]);
 // No loading screen between tabs: the current page stays put and a thin progress line runs until the next one arrives.
 useEffect(()=>{const root=document.documentElement;root.classList.remove('adm-nav');
  const onClick=(e:MouseEvent)=>{if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const a=(e.target as Element|null)?.closest('a');if(!a||a.target==='_blank'||a.hasAttribute('download'))return;const url=new URL(a.href,location.href);if(url.origin!==location.origin||(url.pathname===location.pathname&&url.search===location.search))return;root.classList.add('adm-nav');};
  const onShow=()=>root.classList.remove('adm-nav');
  document.addEventListener('click',onClick);window.addEventListener('pageshow',onShow);
  return()=>{document.removeEventListener('click',onClick);window.removeEventListener('pageshow',onShow);};},[]);
 useEffect(()=>{const dialog=drawer.current;if(!dialog)return;if(open&&!dialog.open)dialog.showModal();else if(!open&&dialog.open)dialog.close();},[open]);
 const navigation=<><Link href="/admin" className="workspace-brand"><img src="/brand/rakvih-mark-128.png" alt=""/><span className="wb-name"><b>Rakvih <i>Digital</i></b><small>Admin console</small></span></Link><p className="workspace-nav-label">YOUR WORKSPACE</p><nav aria-label="Admin navigation">{nav.map(item=><Link key={item.href} href={item.href} aria-current={current===item.href?'page':undefined} className={current===item.href?'active':''}><item.icon size={18}/>{item.label}</Link>)}</nav><div className="workspace-account"><Link href="/" target="_blank" rel="noopener noreferrer"><ExternalLink size={16}/>View website</Link><span title={email}>{email||'Administrator'}</span><form action={adminSignOut}><button><LogOut size={16}/>Sign out</button></form></div></>;
 return <div className="workspace"><div className="adm-progress" aria-hidden="true"/><aside className="workspace-sidebar">{navigation}</aside><button ref={trigger} className="workspace-menu" aria-label="Open admin navigation" aria-expanded={open} onClick={()=>setOpen(true)}><Menu size={19}/><span>Admin menu</span></button><dialog ref={drawer} className="workspace-drawer" onCancel={()=>setOpen(false)} onClose={()=>{setOpen(false);trigger.current?.focus();}} onClick={e=>{if(e.target===e.currentTarget)setOpen(false);}}><button className="workspace-menu-close" aria-label="Close admin navigation" onClick={()=>setOpen(false)}><X size={21}/></button>{navigation}</dialog><div className="workspace-content">{children}</div></div>;
}
