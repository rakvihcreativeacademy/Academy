import 'server-only';
import { configured } from '@/lib/supabase/config';
import { createPublicClient } from '@/lib/supabase/public';
import {
  DEFAULT_VIDEO_FEED_SETTINGS,
  type VideoFeedItem,
  type VideoFeedSettings,
} from '@/lib/video-feeds';

export type PublicVideoFeeds = {
  settings: VideoFeedSettings;
  youtube: VideoFeedItem[];
  instagram: VideoFeedItem[];
};

/** Fetch enabled homepage Video Feeds (YouTube & Instagram) with safe fallback before SQL migration runs. */
export async function getPublicVideoFeeds(): Promise<PublicVideoFeeds> {
  if (!configured) {
    return { settings: DEFAULT_VIDEO_FEED_SETTINGS, youtube: [], instagram: [] };
  }
  try {
    const db = createPublicClient();
    const [settingsRes, itemsRes] = await Promise.all([
      db.from('video_feed_settings').select('section_enabled, youtube_enabled, instagram_enabled, section_title, section_subtitle').eq('id', 1).maybeSingle(),
      db.from('video_feeds').select('id, platform, title, url, caption, enabled, sort_order, created_at').eq('enabled', true).order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
    ]);

    if (settingsRes.error || itemsRes.error) {
      return { settings: DEFAULT_VIDEO_FEED_SETTINGS, youtube: [], instagram: [] };
    }

    const settings: VideoFeedSettings = settingsRes.data
      ? {
          section_enabled: Boolean(settingsRes.data.section_enabled),
          youtube_enabled: Boolean(settingsRes.data.youtube_enabled),
          instagram_enabled: Boolean(settingsRes.data.instagram_enabled),
          section_title: settingsRes.data.section_title || DEFAULT_VIDEO_FEED_SETTINGS.section_title,
          section_subtitle: settingsRes.data.section_subtitle ?? DEFAULT_VIDEO_FEED_SETTINGS.section_subtitle,
        }
      : DEFAULT_VIDEO_FEED_SETTINGS;

    const all = (itemsRes.data ?? []) as VideoFeedItem[];
    return {
      settings,
      youtube: settings.youtube_enabled ? all.filter(v => v.platform === 'youtube') : [],
      instagram: settings.instagram_enabled ? all.filter(v => v.platform === 'instagram') : [],
    };
  } catch {
    return { settings: DEFAULT_VIDEO_FEED_SETTINGS, youtube: [], instagram: [] };
  }
}
