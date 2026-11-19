/** Splits a line into words that rise out of a mask one after another when the parent [data-v] is shown. */
export default function Words({ text, start = 0 }: { text: string; start?: number }) {
  return <>{text.split(' ').map((w, i) => <span key={i}><span className="vw-m"><span className="vw" style={{ '--i': i + start } as React.CSSProperties}>{w}</span></span>{' '}</span>)}</>;
}
