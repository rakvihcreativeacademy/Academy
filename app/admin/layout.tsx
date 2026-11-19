import type { Metadata } from 'next';
import './admin.css';
import './admin-premium.css';
export const metadata: Metadata = {title:{default:'Admin | RAKVIH',template:'%s | RAKVIH Admin'},robots:{index:false,follow:false}};
export default function AdminLayout({children}:{children:React.ReactNode}) {
  return <div className="admin-area">{children}</div>;
}
