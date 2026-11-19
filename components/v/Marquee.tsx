/** Kinetic two-row band of disciplines. Rows run in opposite directions and lean with scroll speed (--vel from Motion). */
const rowA = ['Video Editing', 'Cinematography', 'Photography', 'Filmmaking', 'Content Creation'];
const rowB = ['Motion Graphics', 'Sound Design', 'Podcast Studio', 'Colour Grading', 'Production'];

function Row({ items, reverse, outline }: { items: string[]; reverse?: boolean; outline?: boolean }) {
  const loop = [...items, ...items];
  return <div className={'rk-marquee-row' + (reverse ? ' rev' : '') + (outline ? ' outline' : '')}>
    <div className="rk-marquee-track">
      {loop.map((t, i) => <span key={i} aria-hidden={i >= items.length}>{t}<i className="rk-star">✦</i></span>)}
    </div>
  </div>;
}

export default function Marquee() {
  return <section className="rk-marquee" aria-label="What you can learn at RAKVIH">
    <Row items={rowA} />
    <Row items={rowB} reverse outline />
  </section>;
}
