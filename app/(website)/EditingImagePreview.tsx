'use client';

import { useState } from 'react';
import { AudioLines, MonitorPlay, Palette, Scissors } from 'lucide-react';
import styles from './home-motion.module.css';

const steps = [
  { label: 'Cut', icon: Scissors, image: 'preview-cut.jpg', alt: 'An editor cutting a coastal documentary on a multitrack timeline', width: 1672, height: 941 },
  { label: 'Grade', icon: Palette, image: 'preview-grade.jpg', alt: 'Colour wheels and a before-and-after grade of coastal footage', width: 1672, height: 941 },
  { label: 'Mix', icon: AudioLines, image: 'preview-mix.jpg', alt: 'Hands adjusting audio faders below dialogue, music and effects waveforms', width: 1672, height: 941 },
  { label: 'Export', icon: MonitorPlay, image: 'preview-export.jpg', alt: 'A finished coastal film on a widescreen monitor and in a vertical phone preview', width: 1672, height: 941 },
];

export default function EditingImagePreview() {
  const [active, setActive] = useState(0);
  const step = steps[active];

  return (
    <div className={styles.vidFrame}>
      <div className={styles.vidInner}>
        <img key={step.image} src={`/images/banners/${step.image}`} alt={step.alt} width={step.width} height={step.height} loading="lazy" decoding="async" />
        <div className={styles.vidChips} role="group" aria-label="Video editing steps">
          {steps.map(({ label, icon: Icon }, index) => (
            <button key={label} type="button" aria-pressed={index === active} onClick={() => setActive(index)}>
              <Icon size={15} aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
