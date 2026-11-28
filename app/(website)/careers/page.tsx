import { ArrowDown } from 'lucide-react';
import NeonHero from '@/components/p/NeonHero';
import CareersForm from '@/components/p/CareersForm';
import { getPageContent } from '@/lib/cms/server';

export const metadata = { title: 'Careers' };
// Cached and refreshed on publish (revalidatePath) or every 5 minutes.
export const revalidate = 300;

/** Careers: the banner (text from the admin panel) and a contact form that opens WhatsApp. */
export default async function Page() {
  const { banner: b } = await getPageContent('careers');
  return (
    <main className="pm-page managed-page">
      <NeonHero
        word="Careers"
        pill={b.eyebrow || 'Careers'}
        title={b.title}
        italic={b.italic}
        lede={b.description}
        image="/images/banners/neon-careers.jpg"
      >
        <a className="pm-btn" href="#careers-contact">{b.button_label || 'Start your journey'} <ArrowDown size={15} /></a>
      </NeonHero>
      <CareersForm />
    </main>
  );
}
