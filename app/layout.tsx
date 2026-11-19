import type { Metadata } from 'next';
import { Newsreader, Inter } from 'next/font/google';
import './globals.css';
import './editorial.css';
import './brand-system.css';
import './verdant.css';
import './motion.css';
import './premium.css';
import { site } from '@/lib/site';
import Providers from '@/components/Providers';

const display = Newsreader({ subsets: ['latin'], weight: ['300', '400', '500'], style: ['normal', 'italic'], variable: '--font-display-src', display: 'swap', preload: false });
const sans = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-sans-src', display: 'swap' });

export const metadata: Metadata = {
  title: { default: `${site.name} — ${site.tagline}`, template: `%s | ${site.name}` },
  description: 'RAKVIH Digital — Your Creativity. Our Technology. Infinite Possibilities. Professional training in video editing, cinematography, photography, filmmaking and content creation, a premium podcast studio, production services and technology solutions in Bengaluru.',
  icons: { icon: '/brand/rakvih-logo-square.png' },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning className={`${display.variable} ${sans.variable}`}>
    <head><script dangerouslySetInnerHTML={{ __html: "if(typeof Node==='function'){var R=Node.prototype.removeChild,I=Node.prototype.insertBefore;Node.prototype.removeChild=function(c){return c&&c.parentNode!==this?c:R.apply(this,arguments)};Node.prototype.insertBefore=function(n,r){return r&&r.parentNode!==this?I.call(this,n,null):I.apply(this,arguments)}};var d=document.documentElement;d.classList.add('js');try{if(sessionStorage.getItem('rk-l'))d.classList.add('vl-skip');sessionStorage.setItem('rk-l','1')}catch(e){}" }} /></head>
    <body>
      <Providers>{children}</Providers>
    </body>
  </html>;
}
