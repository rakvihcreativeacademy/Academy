import Link from '@/components/SiteLink';

export type LegalSection = { id: string; title: string; body: React.ReactNode };

/** Shared layout for Privacy Policy and Terms & Conditions: compact dark header, sticky contents, readable paper body. */
import NeonHero from '@/components/p/NeonHero';

export default function LegalPage({ eyebrow, title, intro, updated, sections }: { eyebrow: string; title: string; intro: string; updated: string; sections: LegalSection[] }) {
  return <main className="lp">
    <NeonHero
      word={eyebrow}
      pill={`${eyebrow} · Last updated ${updated}`}
      title={title}
      lede={intro}
      image="/images/banners/cinematic-lens-compact.jpg"
      jumps={sections.map(sec => ({ id: sec.id, label: sec.title }))}
    />
    <section className="lp-body">
      <div className="pm-wrap lp-grid">
        <aside className="lp-toc" aria-label="On this page">
          <p>On this page</p>
          <ol>{sections.map((s, i) => <li key={s.id}><a href={`#${s.id}`}><span>{String(i + 1).padStart(2, '0')}</span>{s.title}</a></li>)}</ol>
        </aside>
        <article className="lp-content">
          {sections.map((s, i) => <section key={s.id} id={s.id}>
            <h2><span>{String(i + 1).padStart(2, '0')}</span>{s.title}</h2>
            {s.body}
          </section>)}
        </article>
      </div>
    </section>
  </main>;
}
