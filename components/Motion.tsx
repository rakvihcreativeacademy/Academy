"use client";
import { useEffect } from 'react';

/*
 * Site-wide motion layer (runs after hydration; everything degrades to static content).
 *  - scroll progress, header hide/show, scroll-velocity skew for marquees
 *  - [data-v] blur/mask reveals + automatic reveals for common blocks on every page
 *  - [data-parallax] / hero media parallax, pointer depth on hero floating cards
 *  - magnetic buttons, 3D tilt + spotlight on cards, count-up numbers, custom cursor
 * Honors prefers-reduced-motion.
 */
const SPOT = '.course-card, .panel, .brand-card, .project-item, .v-card, .v-tile, .v-role, .v-mini';
const TILT = '.v-card, .v-tile, .course-card, .project-item';
const MAGNET = '.pm-btn, .v-pill-white, .v-pill-dark, .v-pill-wa, .v-pill-ghost, .v-pill-sun, .v-pill-outline, .v-apply, .wa-fab, .rk-btn';
const AUTO_REVEAL = [
  'main section h2', 'main .eyebrow', 'main .v-eyebrow',
  'main .v-tile', 'main .course-card', 'main .panel', 'main .project-item', 'main .brand-card',
  'main .v-role-grid > *', 'main .v-prod-list > li', 'main figure:not(.v-glass-quote)',
  '.v-footer-grid > *', '.v-footer-cta',
].join(',');
const PARALLAX = '.v-hb-media, .v-production-bg, .v-studio-card > img, .page-hero-art';

export default function Motion() {
  useEffect(() => {
    // Wait for the full page (including streamed/suspended segments) to load and hydrate
    // before touching the DOM, so React never sees attributes it didn't render.
    let stop: (() => void) | undefined, timer = 0, tries = 0;
    const hydrated = () => {
      const main = document.querySelector('main');
      return !main || Object.keys(main).some(k => k.startsWith('__reactFiber'));
    };
    const poll = () => {
      if ((document.readyState === 'complete' && hydrated()) || ++tries > 100) stop = start();
      else timer = window.setTimeout(poll, 50);
    };
    poll();
    return () => { clearTimeout(timer); stop?.(); };
  }, []);

  return <div className="scroll-progress" aria-hidden="true" />;
}

function start(): () => void {
  {
    const root = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    root.classList.add('motion-ready');
    const cleanups: (() => void)[] = [];

    /* ── reveals ── */
    const autoEls = Array.from(document.querySelectorAll<HTMLElement>(AUTO_REVEAL))
      .filter(el => !el.closest('[data-v], .v-hb, .v-ticker, .v-carousel, [data-no-reveal]') && !el.hasAttribute('data-v'));
    autoEls.forEach(el => {
      const sibs = el.parentElement ? Array.from(el.parentElement.children).filter(c => autoEls.includes(c as HTMLElement)) : [];
      el.style.setProperty('--rv-i', String(Math.min(8, Math.max(0, sibs.indexOf(el)))));
      el.setAttribute('data-rv', '');
    });
    const revealEls = document.querySelectorAll<HTMLElement>('[data-v]:not([data-shown]), [data-rv]');
    const show = (el: Element) => { el.setAttribute('data-shown', ''); el.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp); if (el.hasAttribute('data-count')) countUp(el as HTMLElement); };
    if (reduce || !('IntersectionObserver' in window)) revealEls.forEach(show);
    else {
      const io = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
      revealEls.forEach(el => io.observe(el));
      const cio = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) { countUp(e.target as HTMLElement); cio.unobserve(e.target); }
      }), { threshold: 0.6 });
      document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));
      cleanups.push(() => { io.disconnect(); cio.disconnect(); });
    }

    function countUp(el: HTMLElement) {
      if (el.dataset.counted) return;
      el.dataset.counted = '1';
      const target = Number(el.dataset.count);
      if (!Number.isFinite(target) || reduce) return;
      const node = Array.from(el.childNodes).find(n => n.nodeType === 3 && /\d/.test(n.textContent || ''));
      if (!node) return;
      const tpl = node.textContent || '';
      const t0 = performance.now(), dur = 1400;
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur), v = Math.round(target * (1 - Math.pow(1 - p, 4)));
        node.textContent = tpl.replace(/\d+/, String(v));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }

    /* ── scroll-linked values ── */
    const parallax = Array.from(document.querySelectorAll<HTMLElement>(`${PARALLAX}, [data-parallax]`));
    let raf = 0, lastY = window.scrollY, vel = 0, skewRaf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY, vh = window.innerHeight;
      const max = root.scrollHeight - vh;
      root.style.setProperty('--scroll', String(max > 0 ? y / max : 0));
      root.style.setProperty('--scroll-y', `${y}px`);
      root.classList.toggle('scrolled', y > 40);
      const dy = y - lastY;
      if (Math.abs(dy) > 6) root.classList.toggle('hdr-hide', dy > 0 && y > 420 && !document.querySelector('.mobile-navigation-layer'));
      vel = Math.max(-40, Math.min(40, vel + dy * 0.25));
      lastY = y;
      document.querySelectorAll<HTMLElement>('[data-words]').forEach(el => {
        const r = el.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.25)));
        el.style.setProperty('--p', p.toFixed(3));
      });
      if (!reduce) parallax.forEach(el => {
        const host = el.parentElement || el;
        const r = host.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const speed = Number(el.dataset.parallax || 0.1);
        const center = r.top + r.height / 2 - vh / 2;
        el.style.translate = `0 ${(-center * speed).toFixed(1)}px`;
      });
      if (!skewRaf && !reduce) skewRaf = requestAnimationFrame(settle);
    };
    const settle = () => {
      vel *= 0.88;
      root.style.setProperty('--vel', vel.toFixed(2));
      skewRaf = Math.abs(vel) > 0.05 ? requestAnimationFrame(settle) : 0;
      if (!skewRaf) root.style.setProperty('--vel', '0');
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    cleanups.push(() => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); cancelAnimationFrame(skewRaf); });

    if (!fine || reduce) return () => cleanups.forEach(f => f());

    /* ── pointer: spotlight, tilt, magnet, hero depth ── */
    let magnetEl: HTMLElement | null = null, tiltEl: HTMLElement | null = null;
    const onMove = (e: PointerEvent) => {
      const t = e.target as Element | null;
      const card = t?.closest<HTMLElement>(SPOT);
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      }
      const tilt = t?.closest<HTMLElement>(TILT) || null;
      if (tiltEl && tiltEl !== tilt) tiltEl.style.rotate = '';
      tiltEl = tilt;
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        const ax = (((e.clientY - r.top) / r.height) - 0.5) * -1, ay = (((e.clientX - r.left) / r.width) - 0.5);
        const ang = Math.hypot(ax, ay) * 7;
        tilt.style.rotate = ang > 0.05 ? `${ax.toFixed(3)} ${ay.toFixed(3)} 0 ${ang.toFixed(2)}deg` : '';
      }
      const mag = t?.closest<HTMLElement>(MAGNET) || null;
      if (magnetEl && magnetEl !== mag) magnetEl.style.translate = '';
      magnetEl = mag;
      if (mag) {
        const r = mag.getBoundingClientRect();
        mag.style.translate = `${((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px`;
      }
      const hero = t?.closest<HTMLElement>('.v-hb');
      if (hero) {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty('--px', (((e.clientX - r.left) / r.width) - 0.5).toFixed(3));
        hero.style.setProperty('--py', (((e.clientY - r.top) / r.height) - 0.5).toFixed(3));
      }
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    cleanups.push(() => document.removeEventListener('pointermove', onMove));

    return () => cleanups.forEach(f => f());
  }
}
