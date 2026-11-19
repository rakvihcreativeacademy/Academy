import { Check } from 'lucide-react';

const pillars = [
  { label: 'Practical learning', title: 'Learning by doing, not just by watching.', text: 'Practical-oriented classes with individual attention, so you build real skills on real equipment.', points: ['Hands-on production assignments', 'Individual attention', 'Flexible learning'], img: '/images/academy-filmmaking.webp' },
  { label: 'Professional tools', title: 'Train on the tools the industry uses.', text: 'Exposure to professional cameras, lighting and sound, and industry-relevant software.', points: ['Professional equipment', 'Industry software', 'Experienced trainers'], img: '/images/course-cinematography.webp' },
  { label: 'Studio & production', title: 'A real studio. Real creative projects.', text: 'Access our premium podcast studio and work on films, promos, interviews and digital content.', points: ['Podcast studio access', 'Multi-camera recording', 'Editing support'], img: '/images/academy-studio.webp' },
  { label: 'Portfolio & careers', title: 'Leave with work you can show.', text: 'Build a portfolio as you learn, with guidance on freelancing, interviews and opportunities.', points: ['Portfolio development', 'Career guidance', 'Completion certificate'], img: '/images/academy-photography.webp' },
];

/** Expanding photo panels: hover (or focus) a panel and it opens to reveal its story. Stacks on phones. */
export default function Pillars() {
  return <div className="acc">
    {pillars.map((p, i) => <article key={p.label} className="acc-panel" tabIndex={0} data-v>
      <img src={p.img} alt="" loading="lazy" decoding="async" />
      <span className="acc-shade" />
      <span className="acc-n">0{i + 1}</span>
      <span className="acc-label">{p.label}</span>
      <div className="acc-body">
        <h3>{p.title}</h3>
        <p>{p.text}</p>
        <ul>{p.points.map(x => <li key={x}><Check size={13} />{x}</li>)}</ul>
      </div>
    </article>)}
  </div>;
}
