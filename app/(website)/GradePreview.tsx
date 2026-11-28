'use client';

import { useState } from 'react';
import styles from './home-motion.module.css';

const looks = [
  { label: 'Original', filter: 'none' },
  { label: 'Warm', filter: 'sepia(.4) saturate(1.45) contrast(1.06)' },
  { label: 'Cool', filter: 'hue-rotate(22deg) saturate(.82) contrast(1.15)' },
  { label: 'B&W', filter: 'grayscale(1) contrast(1.22)' },
];

export default function GradePreview() {
  const [selected, setSelected] = useState(0);

  return (
    <article className={styles.editingPanel}>
      <div className={styles.editingImage}>
        <img
          src="/images/banners/editing-grade-cyclist.jpg"
          alt="Cyclist on a winding road above an alpine lake at sunrise"
          width={1536} height={1024} loading="lazy" decoding="async"
          style={{ filter: looks[selected].filter }}
        />
      </div>
      <div className={styles.editingPanelCopy}>
        <h3>Colour that tells a story</h3>
        <p>Try a look to see how colour changes the mood of the same shot.</p>
        <div className={styles.gradeControls} role="group" aria-label="Colour filters">
          {looks.map((look, index) => (
            <button key={look.label} type="button" aria-pressed={selected === index} onClick={() => setSelected(index)}>
              {look.label}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}
