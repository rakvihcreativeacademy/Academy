/** Picks a fitting academy photograph for a content item by keyword, falling back to a rotating set. */
const I = {
  edit: '/images/academy-editing.webp', cine: '/images/course-cinematography.webp', photo: '/images/academy-photography.webp',
  film: '/images/academy-filmmaking.webp', motion: '/images/course-motion-graphics.webp', sound: '/images/course-lighting-sound.webp',
  content: '/images/course-content-creation.webp', ai: '/images/course-ai-creative.webp', studio: '/images/academy-studio.webp',
};
const rules: [RegExp, string][] = [
  [/motion|graphic|animation|vfx|visual effect|logo/i, I.motion],
  [/\bai\b|digital media/i, I.ai],
  [/podcast|interview|discussion|microphone|audio|mix|master|acoustic|voice/i, I.studio],
  [/light|sound/i, I.sound],
  [/edit|post|colour|color/i, I.edit],
  [/cinemat|camera|lens/i, I.cine],
  [/photo|portrait|wedding|commercial|product|image|portfolio/i, I.photo],
  [/film|direct|documentary|short|assistant|production executive|event/i, I.film],
  [/content|creator|youtube|reel|social|influencer|freelance|brand|promo|advert|marketing|corporate|entrepreneur|coach/i, I.content],
];
const pool = Object.values(I);
export function itemImage(title: string, index: number) {
  for (const [re, src] of rules) if (re.test(title)) return src;
  return pool[index % pool.length];
}

/** Images for a whole list: keyword matches, but never the same photo twice in a row. */
export function itemImages(titles: string[]) {
  const out: string[] = [];
  titles.forEach((t, i) => {
    let src = itemImage(t, i);
    if (src === out[i - 1]) {
      const start = pool.indexOf(src);
      for (let k = 1; k < pool.length; k++) { const alt = pool[(start + k) % pool.length]; if (alt !== out[i - 1] && alt !== out[i - 2]) { src = alt; break; } }
    }
    out.push(src);
  });
  return out;
}
