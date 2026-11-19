import { ArrowUpRight, Check, MessageCircle, GraduationCap, Camera, AudioLines } from 'lucide-react';
import EnquiryForm from '@/components/EnquiryForm';
import { site, whatsappLink } from '@/lib/site';

export default function HomeAdmissions() {
  return <section className="home-admissions" id="enquire" aria-labelledby="home-admissions-title">
    <div className="v-wrap">
      <header className="home-admissions-heading">
        <p className="v-eyebrow">Admissions & enquiries</p>
        <h2 id="home-admissions-title">Learn the art. Master the technology.<br /><em>Create your future.</em></h2>
        <p>One small step towards something creative. Tell us what interests you, and we’ll help you find the right direction.</p>
      </header>
      <div className="home-admissions-panel">
        <aside className="home-admissions-intro">
          <img className="home-admissions-mark" src="/brand/rakvih-mark-128.png" alt="RAKVIH" />
          <p className="home-admissions-label">YOUR IDEAS BELONG HERE</p>
          <h3>Let’s find your<br /><em>creative path.</em></h3>
          <p>Starting out, building a new skill or planning your next production? You’re in the right place.</p>
          <ul className="home-admissions-interests"><li><GraduationCap size={18} />Professional courses</li><li><AudioLines size={18} />Podcast studio bookings</li><li><Camera size={18} />Creative production</li></ul>
          <div className="home-admissions-support"><span>Prefer a conversation?</span><a href={whatsappLink(`Hello ${site.name}, I’d like help with a course or studio enquiry.`)} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} />{site.whatsappDisplay}<ArrowUpRight size={15} /></a></div>
        </aside>
        <div className="home-admissions-form">
          <h3>A little about you.</h3>
          <p>Courses, fees and availability — our team will reply on WhatsApp.</p>
          <EnquiryForm allowTypeSwitch />
          <p className="home-admissions-reassurance"><Check size={14} />Beginners welcome. No creative experience needed.</p>
        </div>
      </div>
      <p className="home-admissions-note">Creative learning images are AI-generated illustrations, not photographs of RAKVIH facilities.</p>
    </div>
  </section>;
}
