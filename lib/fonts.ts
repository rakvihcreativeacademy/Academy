import { Cabin, Instrument_Serif, Orbitron, Outfit, Plus_Jakarta_Sans } from 'next/font/google';

/** Headings, buttons and course names on the redesigned pages. */
export const displayFont = Outfit({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--f-display', display: 'swap' });

/** Body text on the redesigned pages. */
export const bodyFont = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--f-body', display: 'swap' });

/** Futuristic wide face for the RAKVIH DIGITAL wordmark in the header and footer. */
export const logoFont = Orbitron({ subsets: ['latin'], weight: ['700', '900'], variable: '--f-logo', display: 'swap' });

/** Class names that define --f-display, --f-body and --f-logo on an element. */
export const fontVars = `${displayFont.variable} ${bodyFont.variable} ${logoFont.variable}`;

/** Home banner: serif headline + Cabin for the pill and buttons (motionsites "datacore" hero style). */
export const serifFont = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--f-serif', display: 'swap' });
export const cabinFont = Cabin({ subsets: ['latin'], weight: ['500', '600'], variable: '--f-cabin', display: 'swap' });
export const heroFontVars = `${serifFont.variable} ${cabinFont.variable}`;
