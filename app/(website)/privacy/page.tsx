import type { Metadata } from 'next';
import Link from '@/components/SiteLink';
import LegalPage, { type LegalSection } from '@/components/p/LegalPage';
import { site } from '@/lib/site';

export const metadata: Metadata = { title: 'Privacy Policy' };

const sections: LegalSection[] = [
  { id: 'who-we-are', title: 'Who we are', body: <>
    <p>This website is operated by {site.name}, a division of RAKVIH Solutions Pvt. Ltd., based in {site.location} (“{site.name}”, “we”, “us”). We offer creative education and training, a podcast studio, media production services and digital technology solutions.</p>
    <p>This policy explains what personal information we collect through this website, why we collect it, and the choices you have.</p>
  </> },
  { id: 'what-we-collect', title: 'Information we collect', body: <>
    <p><strong>Enquiries.</strong> When you send an enquiry about a course, studio booking, production service or anything else, we collect your full name, mobile number, email address, the course or service you are interested in, and — if you provide them — your preferred batch or date, learning mode and message.</p>
    <p><strong>Student accounts.</strong> If you create a student account, we collect your email address and a password (stored securely in encrypted form by our authentication provider). We never see your password.</p>
    <p><strong>Projects you upload.</strong> If you add a project to the student portal, we store the details you enter (such as title, tagline, description, category and website link) and any logo or image you upload.</p>
    <p><strong>Technical information.</strong> Like most websites, our hosting and database providers automatically record basic technical data such as IP address, browser type and the date and time of requests, for security and reliability.</p>
  </> },
  { id: 'how-we-use', title: 'How we use your information', body: <>
    <ul>
      <li>To reply to your enquiry and share details about courses, fees, batches, studio availability or production services.</li>
      <li>To create and manage your student account and the projects in your portfolio.</li>
      <li>To display student projects in our public showcase — only once they are approved and published.</li>
      <li>To keep the website secure, prevent misuse and fix problems.</li>
      <li>To meet our legal and regulatory obligations.</li>
    </ul>
    <p>We do not sell your personal information, and we do not use it for third-party advertising.</p>
  </> },
  { id: 'whatsapp', title: 'Enquiries sent through WhatsApp', body: <>
    <p>Our enquiry forms prepare your message in WhatsApp so you can send it directly to our team at {site.whatsappDisplay}. When you choose to send it, the message is delivered through WhatsApp, which is operated by WhatsApp LLC / Meta and governed by WhatsApp’s own privacy policy. A copy of the enquiry details is also saved securely in our system so our team can follow up.</p>
  </> },
  { id: 'sharing', title: 'Who we share it with', body: <>
    <p>We share information only with service providers that help us run this website, and only as needed:</p>
    <ul>
      <li><strong>Supabase</strong> — database, authentication and file storage for enquiries, accounts and uploaded projects.</li>
      <li><strong>Our website hosting provider</strong> — to serve the website securely.</li>
      <li><strong>WhatsApp</strong> — when you choose to send an enquiry through it.</li>
    </ul>
    <p>We may also disclose information if required by law, or to protect our rights, our users or the public.</p>
  </> },
  { id: 'public', title: 'Information that becomes public', body: <>
    <p>Projects that are approved and published appear in our public student showcase, including their title, description, category, website link and logo. Uploaded logos are stored with public links so they can be displayed. Please do not include private personal information in project details you submit.</p>
  </> },
  { id: 'cookies', title: 'Cookies and local storage', body: <>
    <p>We use only the cookies needed for the website to work — mainly to keep you signed in to your student or admin account. We also store a small, temporary setting in your browser’s session storage to remember that the site has already loaded during your visit. We do not use advertising or tracking cookies.</p>
  </> },
  { id: 'retention', title: 'How long we keep it', body: <>
    <p>We keep enquiries for as long as needed to respond to you and manage any resulting admission, booking or project, and then for a reasonable period for record-keeping. Account and project information is kept while your account is active. You can ask us to delete your information at any time (see “Your rights”).</p>
  </> },
  { id: 'security', title: 'Security', body: <>
    <p>We use reputable providers, encrypted connections (HTTPS), access controls and database security rules so that enquiries can only be read by our authorised team. No method of transmission or storage is completely secure, but we work to protect your information and limit access to it.</p>
  </> },
  { id: 'rights', title: 'Your rights', body: <>
    <p>Subject to applicable law, including India’s Digital Personal Data Protection Act, 2023, you may ask us to access, correct or delete your personal information, or withdraw your consent to us using it. To make a request, contact us using the details below. We may need to verify your identity before acting on a request.</p>
  </> },
  { id: 'children', title: 'Children', body: <>
    <p>Our courses and services are open to learners of different ages. If you are under 18, please send enquiries or create an account with the involvement and consent of a parent or guardian.</p>
  </> },
  { id: 'changes', title: 'Changes to this policy', body: <>
    <p>We may update this policy from time to time. The “Last updated” date above shows when it was last changed. Significant changes will be highlighted on this page.</p>
  </> },
  { id: 'contact', title: 'Contact us', body: <>
    <p>For any privacy question or request, contact {site.name}:</p>
    <ul>
      <li>WhatsApp / phone: <a href={`tel:+${site.whatsapp}`}>{site.whatsappDisplay}</a></li>
      {site.email && <li>Email: <a href={`mailto:${site.email}`}>{site.email}</a></li>}
      <li>Location: {site.location}</li>
    </ul>
    <p>See also our <Link href="/terms">Terms &amp; Conditions</Link>.</p>
  </> },
];

export default function Privacy() {
  return <LegalPage eyebrow="Privacy Policy" title="Privacy Policy" updated="19 November 2026"
    intro={`How ${site.name} collects, uses and protects your information when you use this website, send an enquiry or use the student portal.`}
    sections={sections} />;
}
