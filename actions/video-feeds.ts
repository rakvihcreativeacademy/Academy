'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/cms/server';
import { validateVideoUrl, type VideoFeedItem, type VideoFeedSettings } from '@/lib/video-feeds';

const settingsSchema = z.object({
  section_enabled: z.boolean(),
  youtube_enabled: z.boolean(),
  instagram_enabled: z.boolean(),
  section_title: z.string().trim().min(1, 'Enter a section title.').max(120),
  section_subtitle: z.string().trim().max(300),
});

const itemSchema = z.object({
  platform: z.enum(['youtube', 'instagram']),
  title: z.string().trim().min(1, 'Enter a video title.').max(160),
  url: z.string().trim().min(8, 'Enter a valid link.').max(1000),
  caption: z.string().trim().max(300).optional().default(''),
  enabled: z.boolean().optional().default(true),
});

export async function saveVideoFeedSettings(input: VideoFeedSettings) {
  try {
    const parsed = settingsSchema.parse(input);
    const { db, user } = await requireAdmin();
    const { error } = await db
      .from('video_feed_settings')
      .upsert({ id: 1, ...parsed, updated_by: user.id }, { onConflict: 'id' });
    if (error) throw new Error(error.message);
    revalidatePath('/');
    revalidatePath('/admin/video-feeds');
    return { ok: true as const, settings: parsed };
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof z.ZodError ? e.issues[0].message : e instanceof Error ? e.message : 'Unable to save settings.',
    };
  }
}

export async function createVideoFeed(input: {
  platform: 'youtube' | 'instagram';
  title: string;
  url: string;
  caption?: string;
  enabled?: boolean;
}) {
  try {
    const parsed = itemSchema.parse(input);
    const urlError = validateVideoUrl(parsed.platform, parsed.url);
    if (urlError) return { ok: false as const, error: urlError };

    const { db, user } = await requireAdmin();
    const { data, error } = await db
      .from('video_feeds')
      .insert({
        platform: parsed.platform,
        title: parsed.title,
        url: parsed.url,
        caption: parsed.caption,
        enabled: parsed.enabled,
        created_by: user.id,
      })
      .select('id, platform, title, url, caption, enabled, sort_order, created_at')
      .single();

    if (error) throw new Error(error.message);
    revalidatePath('/');
    revalidatePath('/admin/video-feeds');
    return { ok: true as const, item: data as VideoFeedItem };
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof z.ZodError ? e.issues[0].message : e instanceof Error ? e.message : 'Unable to add video.',
    };
  }
}

export async function updateVideoFeed(
  id: string,
  input: {
    platform: 'youtube' | 'instagram';
    title: string;
    url: string;
    caption?: string;
    enabled?: boolean;
  },
) {
  try {
    z.string().uuid().parse(id);
    const parsed = itemSchema.parse(input);
    const urlError = validateVideoUrl(parsed.platform, parsed.url);
    if (urlError) return { ok: false as const, error: urlError };

    const { db } = await requireAdmin();
    const { data, error } = await db
      .from('video_feeds')
      .update({
        platform: parsed.platform,
        title: parsed.title,
        url: parsed.url,
        caption: parsed.caption,
        enabled: parsed.enabled,
      })
      .eq('id', id)
      .select('id, platform, title, url, caption, enabled, sort_order, created_at')
      .single();

    if (error) throw new Error(error.message);
    revalidatePath('/');
    revalidatePath('/admin/video-feeds');
    return { ok: true as const, item: data as VideoFeedItem };
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof z.ZodError ? e.issues[0].message : e instanceof Error ? e.message : 'Unable to update video.',
    };
  }
}

export async function toggleVideoFeed(id: string, enabled: boolean) {
  try {
    z.string().uuid().parse(id);
    z.boolean().parse(enabled);
    const { db } = await requireAdmin();
    const { error } = await db.from('video_feeds').update({ enabled }).eq('id', id);
    if (error) throw new Error(error.message);
    revalidatePath('/');
    revalidatePath('/admin/video-feeds');
    return { ok: true as const };
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : 'Unable to update video visibility.',
    };
  }
}

export async function deleteVideoFeed(id: string) {
  try {
    z.string().uuid().parse(id);
    const { db } = await requireAdmin();
    const { error } = await db.from('video_feeds').delete().eq('id', id);
    if (error) throw new Error(error.message);
    revalidatePath('/');
    revalidatePath('/admin/video-feeds');
    return { ok: true as const };
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : 'Unable to delete video.',
    };
  }
}
