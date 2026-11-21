export type VideoPlatform = 'youtube' | 'instagram';

export type VideoFeedSettings = {
  section_enabled: boolean;
  youtube_enabled: boolean;
  instagram_enabled: boolean;
  section_title: string;
  section_subtitle: string;
};

export type VideoFeedItem = {
  id: string;
  platform: VideoPlatform;
  title: string;
  url: string;
  caption: string;
  enabled: boolean;
  sort_order: number;
  created_at?: string;
};

export const DEFAULT_VIDEO_FEED_SETTINGS: VideoFeedSettings = {
  section_enabled: true,
  youtube_enabled: true,
  instagram_enabled: true,
  section_title: 'Video Feeds',
  section_subtitle: 'Watch studio reels, student edits, and behind-the-scenes work from RAKVIH Digital.',
};

/** Extract YouTube 11-char video ID from watch, youtu.be, shorts, live, or embed URLs. */
export function parseYouTubeId(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    const host = u.hostname.replace(/^www\./, '').toLowerCase();
    let id = '';
    if (host === 'youtu.be') {
      id = u.pathname.split('/').filter(Boolean)[0] ?? '';
    } else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      if (u.pathname === '/watch') id = u.searchParams.get('v') ?? '';
      else {
        const parts = u.pathname.split('/').filter(Boolean);
        if (['embed', 'shorts', 'live', 'v'].includes(parts[0] ?? '')) id = parts[1] ?? '';
      }
    }
    return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function isYouTubeShort(raw: string): boolean {
  try {
    return new URL(raw.trim()).pathname.startsWith('/shorts/');
  } catch {
    return false;
  }
}

export function getYouTubeEmbedUrl(raw: string): string | null {
  const id = parseYouTubeId(raw);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1` : null;
}

export function getYouTubeThumbUrl(raw: string): string | null {
  const id = parseYouTubeId(raw);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

/** Parse Instagram Reel / Post / TV URL into a clean embed URL. */
export function parseInstagramMedia(raw: string): { type: 'reel' | 'p' | 'tv'; code: string; embedUrl: string } | null {
  try {
    const u = new URL(raw.trim());
    const host = u.hostname.replace(/^www\./, '').toLowerCase();
    if (host !== 'instagram.com' && host !== 'm.instagram.com' && host !== 'instagr.am') return null;
    const parts = u.pathname.split('/').filter(Boolean);
    // Support both /reel/CODE and /username/reel/CODE
    const idx = parts.findIndex(p => p === 'reel' || p === 'reels' || p === 'p' || p === 'tv');
    if (idx === -1 || !parts[idx + 1]) return null;
    const kind = parts[idx] === 'reels' ? 'reel' : (parts[idx] as 'reel' | 'p' | 'tv');
    const code = parts[idx + 1];
    if (!/^[a-zA-Z0-9_-]{5,40}$/.test(code)) return null;
    return {
      type: kind,
      code,
      embedUrl: `https://www.instagram.com/${kind}/${code}/embed/captioned/`,
    };
  } catch {
    return null;
  }
}

export function validateVideoUrl(platform: VideoPlatform, url: string): string | null {
  if (platform === 'youtube') {
    return parseYouTubeId(url) ? null : 'Enter a valid YouTube link (youtube.com/watch?v=..., youtu.be/..., or youtube.com/shorts/...).';
  }
  return parseInstagramMedia(url) ? null : 'Enter a valid Instagram Reel or Post link (instagram.com/reel/... or instagram.com/p/...).';
}
