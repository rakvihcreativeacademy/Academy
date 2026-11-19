"use client";
import { useEffect, useRef, useState } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
export default function LogoUploader({value,onChange,onBusy}:{value:string;onChange:(url:string)=>void;onBusy?:(busy:boolean)=>void}){
 const [preview,setPreview]=useState('');const [busy,setBusy]=useState(false);const [drag,setDrag]=useState(false);const input=useRef<HTMLInputElement>(null);
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview);},[preview]);
 async function upload(file?:File){if(!file||busy)return;if(!['image/png','image/jpeg','image/svg+xml','image/webp'].includes(file.type)||file.size>2097152){toast.error('Choose PNG, JPG, SVG or WEBP up to 2MB');return;}
 setPreview(URL.createObjectURL(file));setBusy(true);onBusy?.(true);
 try{const db=createClient();const {data:{user}}=await db.auth.getUser();if(!user)throw new Error('Please sign in first');
 const extension=({'image/png':'png','image/jpeg':'jpg','image/svg+xml':'svg','image/webp':'webp'} as Record<string,string>)[file.type];
 const path=`${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
 const {error}=await db.storage.from('project-logos').upload(path,file,{contentType:file.type,upsert:false});if(error)throw error;
 const {data}=db.storage.from('project-logos').getPublicUrl(path);onChange(data.publicUrl);toast.success('Logo uploaded');
 }catch(e){toast.error(e instanceof Error?e.message:'Upload failed');}finally{setPreview('');setBusy(false);onBusy?.(false);if(input.current)input.current.value='';}}
 return <div><div className={'dropzone '+(drag?'dragging':'')} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);void upload(e.dataTransfer.files[0]);}}><input ref={input} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="sr-only" aria-label="Upload project logo" onChange={e=>void upload(e.target.files?.[0])}/><button type="button" disabled={busy} onClick={()=>input.current?.click()} className="upload-trigger">{preview||value?<img src={preview||value} alt="Project logo preview" className="upload-preview"/>:<UploadCloud size={27}/>}<strong>{busy?'Uploading…':value?'Replace logo':'Drop your logo here'}</strong><span>{busy?'Upload in progress':'or click to browse · PNG, JPG, SVG, WEBP · 2MB max'}</span></button>{busy&&<progress aria-label="Uploading logo" className="w-full"/>}</div>{value&&!busy&&<button type="button" className="text-link mt-2" onClick={()=>onChange('')}><X size={14}/>Remove logo</button>}</div>;
}
