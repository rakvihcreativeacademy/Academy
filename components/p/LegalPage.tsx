import Link from '@/components/SiteLink';

export type LegalSection = { id: string; title: string; body: React.ReactNode };

/** Shared layout for Privacy Policy and Terms & Conditions: compact dark header, sticky contents, readable paper body. */
export default function LegalPage({ eyebrow, title, intro, updated, sections }: { eyebrow: string; title: string; intro: string; updated: string; sections: LegalSection[] }) {
  return <main className="lp">
    <section className="lp-head" data-hero data-dark>
      <div className="pm-wrap">
        <nav className="pm-crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><i aria-hidden="true" /><span aria-current="page">{eyebrow}</span></nav>
        <h1>{title}</h1>
        <p className="lp-intro">{intro}</p>
        <p className="lp-updated">Last updated: {updated}</p>
      </div>
    </section>
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
