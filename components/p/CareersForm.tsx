'use client';
import { useState, type FormEvent } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { site, whatsappLink } from '@/lib/site';
import styles from './CareersForm.module.css';

const interests = ['Career guidance', 'Course admission', 'Internship / live project', 'Job opportunity at RAKVIH', 'Something else'];

/** Careers contact form: builds a message and opens WhatsApp (site.whatsapp) with it pre-filled. */
export default function CareersForm() {
  const [error, setError] = useState('');

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get('name') || '').trim();
    const phone = String(f.get('phone') || '').trim();
    const message = String(f.get('message') || '').trim();
    if (!name || !phone || !message) { setError('Please fill in your name, phone number and message.'); return; }
    setError('');
    const lines = [
      `Hello ${site.name}, I'm reaching out from the Careers page.`,
      '',
      `Name: ${name}`,
      `Phone: ${phone}`,
      f.get('email') ? `Email: ${String(f.get('email')).trim()}` : '',
      `Interested in: ${f.get('interest')}`,
      '',
      message,
    ].filter((l, i, a) => l !== '' || a[i - 1] !== '');
    window.open(whatsappLink(lines.join('\n')), '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="careers-contact" className={styles.sec} aria-labelledby="careers-contact-title">
      <div className={`pm-wrap ${styles.grid}`}>
        <div className={styles.copy}>
          <span className={styles.pill}><i /> Talk to us</span>
          <h2 id="careers-contact-title">Let&rsquo;s talk about <em>your career.</em></h2>
          <p>Tell us where you want to go, whether that&rsquo;s guidance on a creative career, a course, or a live project. Your message opens straight in WhatsApp, so our team can reply quickly.</p>
          <a className={styles.direct} href={whatsappLink(`Hello ${site.name}, I'd like to talk about careers.`)} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={18} /> {site.whatsappDisplay}
          </a>
        </div>

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <div className={styles.row}>
            <label>Full name<input name="name" required maxLength={80} autoComplete="name" placeholder="Your full name" /></label>
            <label>Phone number<input name="phone" type="tel" required maxLength={20} autoComplete="tel" placeholder="+91 98765 43210" /></label>
          </div>
          <div className={styles.row}>
            <label><span className={styles.lbl}>Email <small>(optional)</small></span><input name="email" type="email" maxLength={120} autoComplete="email" placeholder="you@example.com" /></label>
            <label>I&rsquo;m interested in
              <select name="interest" defaultValue={interests[0]}>{interests.map(i => <option key={i}>{i}</option>)}</select>
            </label>
          </div>
          <label>Message<textarea name="message" required maxLength={1000} rows={5} placeholder="Tell us a little about yourself and what you're looking for" /></label>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <button type="submit" className={styles.submit}><Send size={18} /> Send on WhatsApp</button>
          <p className={styles.note}>Opens WhatsApp with your message ready to send.</p>
        </form>
      </div>
    </section>
  );
}
