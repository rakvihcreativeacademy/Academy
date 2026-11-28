'use client';
import { useEffect, useRef } from 'react';

const DOTS = 14;

/**
 * Glowing cursor with a trail of fading dots that follows the mouse.
 * Desktop (fine pointer) only, off for reduced-motion users. The normal cursor stays visible,
 * so text selection, links and form fields keep working as usual.
 */
export default function CursorTrail() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const dots = Array.from(el.children) as HTMLElement[];
    const pts = dots.map(() => ({ x: -100, y: -100 }));
    const mouse = { x: -100, y: -100 };
    let raf = 0, shown = false, idle = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      mouse.x = e.clientX; mouse.y = e.clientY;
      if (!shown) { shown = true; pts.forEach(p => { p.x = mouse.x; p.y = mouse.y; }); el.classList.add('on'); }
      idle = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLeave = () => { shown = false; el.classList.remove('on'); };
    const onDown = () => el.classList.add('press');
    const onUp = () => el.classList.remove('press');

    const tick = () => {
      raf = 0;
      let x = mouse.x, y = mouse.y, moving = false;
      pts.forEach((p, i) => {
        const k = i === 0 ? 0.55 : 0.42;
        const nx = p.x + (x - p.x) * k, ny = p.y + (y - p.y) * k;
        if (Math.abs(nx - p.x) > 0.1 || Math.abs(ny - p.y) > 0.1) moving = true;
        p.x = nx; p.y = ny;
        dots[i].style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
        x = p.x; y = p.y;
      });
      // keep animating until the trail has caught up with the cursor
      if (moving || idle++ < 4) raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  return (
    <div ref={host} className="rk-cursor" aria-hidden="true">
      {Array.from({ length: DOTS }, (_, i) => <i key={i} style={{ ['--n' as string]: i }} />)}
    </div>
  );
}
