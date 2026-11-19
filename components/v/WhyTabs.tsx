'use client';
import { useState } from 'react';
import Link from '@/components/SiteLink';
import { ArrowUpRight, Hand, Camera, Mic, FolderOpen, Check } from 'lucide-react';

const tabs = [
  {
    icon: Hand, label: 'Practical learning', title: 'Learning by doing, not just by watching.',
    text: 'Practical-oriented classes with individual attention, so you build real skills on real equipment and grow at your own pace.',
    points: ['Practical-oriented learning', 'Hands-on production assignments', 'Individual attention', 'Flexible learning opportunities'],
    href: '/courses', cta: 'Explore the courses',
  },
  {
    icon: Camera, label: 'Professional tools', title: 'Train on the tools the industry uses.',
    text: 'Get exposure to professional cameras, lighting and sound, and learn industry-relevant software with experienced trainers.',
    points: ['Professional equipment exposure', 'Industry-relevant software training', 'Experienced industry trainers', 'Lighting & sound practice'],
    href: '/courses', cta: 'See what you will learn',
  },
  {
    icon: Mic, label: 'Studio & production', title: 'A real studio. Real creative projects.',
    text: 'Access our premium podcast studio and work on short films, promotional videos, interviews and digital content.',
    points: ['Premium podcast studio access', 'Real-world creative projects', 'Multi-camera video recording', 'Professional editing support'],
    href: '/podcast-studio', cta: 'Visit the podcast studio',
  },
  {
    icon: FolderOpen, label: 'Portfolio & careers', title: 'Leave with work you can show.',
    text: 'Build a portfolio as you learn, and get guidance on freelancing, interviews and career opportunities in creative media.',
    points: ['Portfolio development', 'Career guidance', 'Freelancing guidance', 'Course-completion certificate'],
    href: '/careers', cta: 'Explore career paths',
  },
];

const ITEM = 76, PAD = 40, H = PAD * 2 + ITEM * tabs.length, X = 74, BULGE = 14;

export default function WhyTabs() {
  const [a, setA] = useState(0);
  const c = PAD + ITEM * a + ITEM / 2;
  const d = `M${X},0 L${X},${c - 110} C${X},${c - 50} ${BULGE},${c - 52} ${BULGE},${c} C${BULGE},${c + 52} ${X},${c + 50} ${X},${c + 110} L${X},${H}`;
  const t = tabs[a];
  return <div className="v-why">
    <div className="v-why-list" role="tablist" aria-label="Why RAKVIH" style={{ paddingBlock: PAD }}>
      {tabs.map((x, i) => <button key={x.label} type="button" role="tab" id={`why-tab-${i}`} aria-selected={a === i} aria-controls="why-panel" style={{ height: ITEM }}
        onClick={() => setA(i)} onMouseEnter={() => setA(i)}>
        <span className="v-why-ico"><x.icon size={17} strokeWidth={1.6} /></span>{x.label}
      </button>)}
    </div>
    <svg className="v-why-curve" viewBox={`0 0 90 ${H}`} width="90" height={H} aria-hidden="true">
      <path d={d} style={{ d: `path("${d}")` } as React.CSSProperties} />
      <circle cx={BULGE} cy={c} r="12" style={{ cy: c } as React.CSSProperties} />
    </svg>
    <div className="v-why-rule" aria-hidden="true" />
    <div className="v-why-panel" id="why-panel" role="tabpanel" aria-labelledby={`why-tab-${a}`} key={a}>
      <div className="v-why-card">
        <p>{t.label}</p>
        <ul>{t.points.map(p => <li key={p}><Check size={14} />{p}</li>)}</ul>
      </div>
      <h3>{t.title}</h3>
      <p className="v-why-text">{t.text}</p>
      <Link href={t.href} className="v-why-link"><img src="/brand/rakvih-mark-128.png" alt="" />{t.cta}<span><ArrowUpRight size={15} /></span></Link>
    </div>
  </div>;
}
