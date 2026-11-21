import { z } from 'zod';
export const pageKeys = ['courses', 'podcast-studio', 'production', 'projects', 'careers'] as const;
export type PageKey = typeof pageKeys[number];
export type CourseStatus = 'live' | 'upcoming';
const text = z.string().max(20000);
export const safeLink = z.string().max(2048).refine(v => !v || /^#[a-zA-Z][\w-]*$/.test(v) || /^\/(?!\/)[^\s\\]*$/.test(v) || /^https:\/\/[^\s]+$/.test(v), 'Use a local /path or an https:// URL.');
const item = z.object({
  slug: z.string().regex(/^[a-z0-9-]*$/).max(120).optional(),
  title: text,
  description: text,
  image: safeLink,
  details: z.array(text).max(100),
  href: safeLink,
  status: z.enum(['live', 'upcoming']).optional(),
  enabled: z.boolean().optional(),
});
export const contentSchema = z.object({
  banner: z.object({ eyebrow: text, title: z.string().min(1).max(200), italic: text, description: text, image: safeLink, image_alt: text, button_label: text, button_link: safeLink }),
  sections: z.array(z.object({ eyebrow: text, title: text, description: text, items: z.array(item).max(100) })).max(30),
  enquiry: z.object({ enabled: z.boolean(), title: text, description: text }),
});
export type ContentItem = z.infer<typeof item>;
export type PageContent = z.infer<typeof contentSchema>;
export type ContentRecord = { key: PageKey; draft: PageContent; published: PageContent | null; revision: number; updated_at: string; published_at: string | null };

/** Resolve a course item's live/upcoming status (defaults to live for Professional Video Editing, upcoming for others). */
export function resolveCourseStatus(it: Pick<ContentItem, 'slug' | 'title' | 'status'>): CourseStatus {
  if (it.status === 'live' || it.status === 'upcoming') return it.status;
  return it.slug === 'video-editing' || /professional video editing/i.test(it.title) ? 'live' : 'upcoming';
}

/** Whether a course item is turned ON (visible on the website). Defaults to true for legacy records. */
export function isCourseEnabled(it: Pick<ContentItem, 'enabled'>): boolean {
  return it.enabled !== false;
}
