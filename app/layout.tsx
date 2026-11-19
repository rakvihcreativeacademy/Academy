import type { Metadata } from 'next';
import { Newsreader, Inter } from 'next/font/google';
import './globals.css';
import './editorial.css';
import './brand-system.css';
import './verdant.css';
import './motion.css';
import { site } from '@/lib/site';
import Providers from '@/components/Providers';

const display = Newsreader({ subsets: ['latin'], weight: ['300', '400', '500'], style: ['normal', 'italic'], variable: '--font-display-src', display: 'swap' });
const sans = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-sans-src', display: 'swap' });

export const metadata: Metadata = {
  title: { default: `${site.name} — ${site.tagline}`, template: `%s | ${site.name}` },
  description: 'Professional training in video editing, cinematography, photography, filmmaking and content creation, a premium podcast studio and production services in Bengaluru.',
  icons: { icon: '/brand/rakvih-logo-square.png' },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning className={`${display.variable} ${sans.variable}`}>
    <head><script dangerouslySetInnerHTML={{ __html: "var d=document.documentElement;d.classList.add('js');try{if(sessionStorage.getItem('rk-l'))d.classList.add('vl-skip');sessionStorage.setItem('rk-l','1')}catch(e){}" }} /></head>
    <body>
      <Providers>{children}</Providers>
    </body>
  </html>;
}
