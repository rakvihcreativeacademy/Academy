import type { Metadata } from 'next';
import Link from '@/components/SiteLink';
import LegalPage, { type LegalSection } from '@/components/p/LegalPage';
import { site } from '@/lib/site';

export const metadata: Metadata = { title: 'Terms & Conditions' };

const sections: LegalSection[] = [
  { id: 'about', title: 'About these terms', body: <>
    <p>These terms apply to your use of this website, operated by {site.name}, a division of RAKVIH Solutions Pvt. Ltd., {site.location}. By using the website you agree to these terms. If you do not agree, please do not use the website.</p>
  </> },
  { id: 'services', title: 'Our services', body: <>
    <p>{site.name} offers creative education and training, a premium podcast studio, media production services and digital technology solutions. Information on this website — including course content, modules, facilities and services — describes what we offer in general and may change over time.</p>
  </> },
  { id: 'enquiries', title: 'Enquiries are not bookings', body: <>
    <p>Sending an enquiry through this website or WhatsApp is a request for information. It does not by itself confirm an admission, a studio booking or a production order. Fees, course duration, batch timings, studio rates and availability are confirmed directly by our team, and any admission, booking or project is governed by the terms we share with you at that time.</p>
  </> },
  { id: 'courses', title: 'Courses and certificates', body: <>
    <ul>
      <li>Course content, schedules and trainers may be updated to keep training relevant.</li>
      <li>Certificates issued are {site.name} course-completion certificates, unless an external accreditation is expressly stated for a specific course.</li>
      <li>Career guidance and placement assistance are offered subject to available opportunities. We do not guarantee employment, placements or earnings.</li>
    </ul>
  </> },
  { id: 'studio', title: 'Podcast studio and production', body: <>
    <p>Studio bookings and production projects are subject to availability, confirmation and the specific rates, payment, cancellation and usage terms we agree with you. Please take care of the studio, its equipment and other users while on our premises.</p>
  </> },
  { id: 'accounts', title: 'Student accounts', body: <>
    <p>You are responsible for keeping your login details safe and for activity under your account. Please give accurate information. We may suspend or remove accounts that are misused or that breach these terms.</p>
  </> },
  { id: 'your-work', title: 'Your projects and content', body: <>
    <ul>
      <li>You keep ownership of the projects, logos and other content you upload.</li>
      <li>By submitting a project for the student showcase, you allow {site.name} to display it on this website and in related promotion of our academy, with credit where appropriate. You can ask us to remove it at any time.</li>
      <li>You confirm you have the right to upload the content, including any permissions needed from people, brands or music that appear in it.</li>
      <li>Do not upload content that is unlawful, misleading, offensive or infringes anyone else’s rights. We may remove such content.</li>
    </ul>
  </> },
  { id: 'acceptable-use', title: 'Acceptable use', body: <>
    <p>Do not misuse the website — for example by attempting to gain unauthorised access, interfering with its security or operation, sending spam or automated enquiries, or copying the site’s content for commercial use without permission.</p>
  </> },
  { id: 'ip', title: 'Our content', body: <>
    <p>The website’s design, text, graphics and branding, including the RAKVIH name and logo, belong to RAKVIH Solutions Pvt. Ltd. or its licensors. You may view and share pages for personal, non-commercial use. Some images on this website are illustrative and may not show our actual facilities.</p>
  </> },
  { id: 'links', title: 'Third-party links and services', body: <>
    <p>The website links to services such as WhatsApp and social media platforms. These are run by third parties under their own terms and policies, and we are not responsible for their content or practices.</p>
  </> },
  { id: 'liability', title: 'Limitation of liability', body: <>
    <p>We work to keep the website accurate and available, but it is provided “as is” and may occasionally contain errors or be unavailable. To the extent permitted by law, {site.name} is not liable for indirect or consequential loss arising from use of the website. Nothing in these terms limits liability that cannot be limited under applicable law.</p>
  </> },
  { id: 'law', title: 'Governing law', body: <>
    <p>These terms are governed by the laws of India. Any dispute will be subject to the jurisdiction of the courts in Bengaluru, Karnataka.</p>
  </> },
  { id: 'changes', title: 'Changes to these terms', body: <>
    <p>We may update these terms from time to time. The “Last updated” date above shows the latest version, and continued use of the website means you accept the updated terms.</p>
  </> },
  { id: 'contact', title: 'Contact us', body: <>
    <p>Questions about these terms? Contact {site.name}:</p>
    <ul>
      <li>WhatsApp / phone: <a href={`tel:+${site.whatsapp}`}>{site.whatsappDisplay}</a></li>
      {site.email && <li>Email: <a href={`mailto:${site.email}`}>{site.email}</a></li>}
      <li>Location: {site.location}</li>
    </ul>
    <p>See also our <Link href="/privacy">Privacy Policy</Link>.</p>
  </> },
];

export default function Terms() {
  return <LegalPage eyebrow="Terms & Conditions" title="Terms & Conditions" updated="19 November 2026"
    intro={`The terms for using the ${site.name} website, sending enquiries and using the student portal.`}
    sections={sections} />;
}
