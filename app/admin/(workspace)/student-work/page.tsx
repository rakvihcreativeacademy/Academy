import Link from '@/components/SiteLink';
import AdminRecords from '@/components/AdminRecords';
export const metadata={title:'Student Work'};
export default function Page(){return <><div className="workspace-work-links"><Link href="/admin/content?page=projects">Edit showcase page text & images ↗</Link></div><AdminRecords tab="projects"/></>;}
