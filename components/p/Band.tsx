/** Kinetic band of words (pure CSS marquee). Alternate words take the accent treatment. */
export default function Band({ words, tone = 'sun' }: { words: string[]; tone?: 'sun' | 'ink' }) {
  const list = words.filter(Boolean).slice(0, 10);
  if (!list.length) return null;
  return <div className={'pm-band ' + tone} aria-hidden="true">
    <div>{[0, 1].map(k => list.map((t, j) => <span key={`${k}-${j}`}>{j % 2 ? <em>{t}</em> : t}</span>))}</div>
  </div>;
}
