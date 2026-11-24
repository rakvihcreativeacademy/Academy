'use client';
import { useEffect } from 'react';

/*
 * Lean motion layer for the public site. Only toggles classes on change or writes transforms to
 * individual elements, so scrolling never restyles the whole document.
 *  - [data-v] reveals (IntersectionObserver → data-shown)
 *  - html.scrolled (header glass), scroll progress bar, [data-parallax]
 *  - page changes are native (no interception); pages are warmed on hover so they open instantly.
 */

/** Sections that stay cinematic-dark in both themes (photographs, film, the 3D camera). */
const MEDIA = '.pm-hero-simple, .pm-hx, .pm-banner, .pm-se:not(.pm-st), .pm-prod, .ap-hero, .lg-visual';

export default function Motion() {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups: (() => void)[] = [];

    /* reveals */
    const show = (el: Element) => el.setAttribute('data-shown', '');
    const pending = Array.from(document.querySelectorAll('[data-v]:not([data-shown])'));
    if (reduce || !('IntersectionObserver' in window)) pending.forEach(show);
    else {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
      pending.forEach(el => io.observe(el));
      cleanups.push(() => io.disconnect());
    }

    /* scroll-linked: header glass, progress, parallax */
    root.classList.remove('hdr-hide');
    const bar = document.querySelector<HTMLElement>('.scroll-progress');
    const parallax = reduce ? [] : Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
    let scrolled = false, raf = 0, overMedia: boolean | null = null;
    const update = () => {
      raf = 0;
      const y = window.scrollY, vh = window.innerHeight, max = root.scrollHeight - vh;
      const s = y > 40;
      if (s !== scrolled) { scrolled = s; root.classList.toggle('scrolled', s); }
      // header tone: over film/photo sections it keeps its dark glass; elsewhere it follows the theme
      const probe = document.elementsFromPoint(window.innerWidth / 2, (parseFloat(getComputedStyle(root).getPropertyValue('--pm-head')) || 84) + 6)
        .find(el => !el.closest('.pm-head, .pm-chapters, .scroll-progress, .wa-fab'));
      const onMedia = !!probe?.closest(MEDIA);
      if (onMedia !== overMedia) { overMedia = onMedia; root.classList.toggle('hdr-media', onMedia); }
      if (bar) bar.style.transform = `scaleX(${max > 0 ? (y / max).toFixed(4) : 0})`;
      for (const el of parallax) {
        const r = (el.parentElement || el).getBoundingClientRect();
        if (r.bottom < -50 || r.top > vh + 50) continue;
        const k = Number(el.dataset.parallax || 0.08);
        el.style.transform = `translate3d(0, ${((r.top + r.height / 2 - vh / 2) * -k).toFixed(1)}px, 0)`;
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    cleanups.push(() => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); });


    /* page changes: links navigate natively and instantly; supporting browsers cross-fade via CSS view transitions */
    if (!reduce) {
      /* warm the next page on hover/touch so navigation is near-instant */
      const warmed = new Set<string>();
      const warm = (e: Event) => {
        const a = (e.target as Element | null)?.closest?.('a');
        if (!a || a.target === '_blank') return;
        const url = new URL(a.href, location.href);
        if (url.origin !== location.origin || url.pathname.startsWith('/admin') || url.pathname === location.pathname) return;
        const key = url.pathname + url.search;
        if (warmed.has(key)) return;
        warmed.add(key);
        const l = document.createElement('link');
        l.rel = 'prefetch'; l.href = key; l.as = 'document';
        document.head.appendChild(l);
      };
      document.addEventListener('pointerover', warm, { passive: true });
      document.addEventListener('touchstart', warm, { passive: true });
      cleanups.push(() => { document.removeEventListener('pointerover', warm); document.removeEventListener('touchstart', warm); });
    }

    root.classList.add('motion-ready');
    // spotlight: cards light up where the pointer is (CSS reads --mx / --my)
    const spot = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const card = (e.target as Element | null)?.closest?.('.pm-cell, .bento-card, .ap-course, .pm-pillar, .cs-card, .pm-cover, .pm-form-card, .lp-content section') as HTMLElement | null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    document.addEventListener('pointermove', spot, { passive: true });
    cleanups.push(() => document.removeEventListener('pointermove', spot));
    return () => cleanups.forEach(f => f());
  }, []);

  return <div className="scroll-progress" aria-hidden="true" />;
}
