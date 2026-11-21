import { redirect } from 'next/navigation';
import AdminVideoFeeds from '@/components/AdminVideoFeeds';
import { requireAdmin } from '@/lib/cms/server';
import { configured } from '@/lib/supabase/config';
import { DEFAULT_VIDEO_FEED_SETTINGS, type VideoFeedItem, type VideoFeedSettings } from '@/lib/video-feeds';

export const metadata = { title: 'Video Feeds' };
export const dynamic = 'force-dynamic';

export default async function AdminVideoFeedsPage() {
  if (!configured) {
    return (
      <AdminVideoFeeds
        initialSettings={DEFAULT_VIDEO_FEED_SETTINGS}
        initialItems={[]}
        setupNeeded
      />
    );
  }

  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    redirect('/admin/login?next=/admin/video-feeds');
  }

  const [settingsRes, itemsRes] = await Promise.all([
    admin.db.from('video_feed_settings').select('section_enabled, youtube_enabled, instagram_enabled, section_title, section_subtitle').eq('id', 1).maybeSingle(),
    admin.db.from('video_feeds').select('id, platform, title, url, caption, enabled, sort_order, created_at').order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
  ]);

  const setupNeeded = Boolean(settingsRes.error || itemsRes.error);
  const initialSettings: VideoFeedSettings = settingsRes.data
    ? {
        section_enabled: Boolean(settingsRes.data.section_enabled),
        youtube_enabled: Boolean(settingsRes.data.youtube_enabled),
        instagram_enabled: Boolean(settingsRes.data.instagram_enabled),
        section_title: settingsRes.data.section_title || DEFAULT_VIDEO_FEED_SETTINGS.section_title,
        section_subtitle: settingsRes.data.section_subtitle ?? DEFAULT_VIDEO_FEED_SETTINGS.section_subtitle,
      }
    : DEFAULT_VIDEO_FEED_SETTINGS;

  return (
    <AdminVideoFeeds
      initialSettings={initialSettings}
      initialItems={(itemsRes.data ?? []) as VideoFeedItem[]}
      setupNeeded={setupNeeded}
    />
  );
}
