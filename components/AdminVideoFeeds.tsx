'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { ExternalLink, Instagram, Pencil, Plus, Save, Trash2, X, Youtube } from 'lucide-react';
import Link from '@/components/SiteLink';
import {
  createVideoFeed,
  deleteVideoFeed,
  saveVideoFeedSettings,
  toggleVideoFeed,
  updateVideoFeed,
} from '@/actions/video-feeds';
import {
  getYouTubeThumbUrl,
  parseInstagramMedia,
  validateVideoUrl,
  type VideoFeedItem,
  type VideoFeedSettings,
  type VideoPlatform,
} from '@/lib/video-feeds';

export default function AdminVideoFeeds({
  initialSettings,
  initialItems,
  setupNeeded,
}: {
  initialSettings: VideoFeedSettings;
  initialItems: VideoFeedItem[];
  setupNeeded: boolean;
}) {
  const [settings, setSettings] = useState<VideoFeedSettings>(initialSettings);
  const [items, setItems] = useState<VideoFeedItem[]>(initialItems);
  const [tab, setTab] = useState<VideoPlatform>('youtube');
  const [savingSettings, setSavingSettings] = useState(false);

  // Add form state
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [adding, setAdding] = useState(false);

  // Inline edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const ytItems = items.filter(i => i.platform === 'youtube');
  const igItems = items.filter(i => i.platform === 'instagram');
  const currentItems = tab === 'youtube' ? ytItems : igItems;

  const persistSettings = async (next: VideoFeedSettings, silent = false) => {
    setSettings(next);
    setSavingSettings(true);
    try {
      const res = await saveVideoFeedSettings(next);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      if (!silent) toast.success('Video Feeds settings saved');
    } catch {
      toast.error('Unable to save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const urlErr = validateVideoUrl(tab, url);
    if (urlErr) {
      toast.error(urlErr);
      return;
    }
    setAdding(true);
    try {
      const res = await createVideoFeed({
        platform: tab,
        title: title.trim(),
        url: url.trim(),
        caption: caption.trim(),
        enabled,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setItems(prev => [res.item, ...prev]);
      setTitle('');
      setUrl('');
      setCaption('');
      setEnabled(true);
      toast.success(tab === 'youtube' ? 'YouTube video added' : 'Instagram video added');
    } catch {
      toast.error('Unable to add video.');
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (item: VideoFeedItem) => {
    setEditId(item.id);
    setEditTitle(item.title);
    setEditUrl(item.url);
    setEditCaption(item.caption || '');
  };

  const handleUpdate = async (item: VideoFeedItem) => {
    const urlErr = validateVideoUrl(item.platform, editUrl);
    if (urlErr) {
      toast.error(urlErr);
      return;
    }
    setBusyId(item.id);
    try {
      const res = await updateVideoFeed(item.id, {
        platform: item.platform,
        title: editTitle.trim(),
        url: editUrl.trim(),
        caption: editCaption.trim(),
        enabled: item.enabled,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setItems(prev => prev.map(x => (x.id === item.id ? res.item : x)));
      setEditId(null);
      toast.success('Video updated');
    } catch {
      toast.error('Unable to update video.');
    } finally {
      setBusyId(null);
    }
  };

  const handleToggle = async (item: VideoFeedItem) => {
    const nextEnabled = !item.enabled;
    setBusyId(item.id);
    setItems(prev => prev.map(x => (x.id === item.id ? { ...x, enabled: nextEnabled } : x)));
    try {
      const res = await toggleVideoFeed(item.id, nextEnabled);
      if (!res.ok) {
        setItems(prev => prev.map(x => (x.id === item.id ? { ...x, enabled: item.enabled } : x)));
        toast.error(res.error);
        return;
      }
      toast.success(nextEnabled ? 'Video turned On' : 'Video turned Off');
    } catch {
      setItems(prev => prev.map(x => (x.id === item.id ? { ...x, enabled: item.enabled } : x)));
      toast.error('Unable to update video status.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item: VideoFeedItem) => {
    if (!confirm(`Delete "${item.title}" from Video Feeds?`)) return;
    setBusyId(item.id);
    try {
      const res = await deleteVideoFeed(item.id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setItems(prev => prev.filter(x => x.id !== item.id));
      if (editId === item.id) setEditId(null);
      toast.success('Video deleted');
    } catch {
      toast.error('Unable to delete video.');
    } finally {
      setBusyId(null);
    }
  };

  const previewThumb = tab === 'youtube' ? getYouTubeThumbUrl(url) : null;
  const previewIg = tab === 'instagram' ? parseInstagramMedia(url) : null;

  return (
    <main className="admin-body">
      <header className="cms-toolbar">
        <div>
          <span className="v-eyebrow">HOMEPAGE MEDIA</span>
          <h1>Video Feeds</h1>
          <p>Manage YouTube videos and Instagram reels shown above “Why choose RAKVIH Digital?” on the homepage.</p>
        </div>
        <div>
          <Link href="/#video-feeds" target="_blank" rel="noopener noreferrer">View on homepage ↗</Link>
        </div>
      </header>

      {setupNeeded && (
        <p className="notice" style={{ marginBottom: 20 }}>
          Database setup required: run <code>supabase/007_video_feeds.sql</code> in your Supabase SQL Editor, then reload this page.
        </p>
      )}

      {/* Section Master Controls */}
      <section className="vf-admin-card" aria-label="Video Feeds section visibility">
        <div className="vf-admin-head">
          <div>
            <h2>Section Visibility &amp; Heading</h2>
            <p>Turn the entire Video Feeds section (or YouTube / Instagram individually) on or off on the homepage.</p>
          </div>
          <div className="vf-admin-switches">
            <button
              type="button"
              role="switch"
              aria-checked={settings.section_enabled}
              disabled={setupNeeded || savingSettings}
              className={'cms-switch' + (settings.section_enabled ? ' on' : '')}
              onClick={() => persistSettings({ ...settings, section_enabled: !settings.section_enabled })}
            >
              <span className="cms-switch-track"><span className="cms-switch-thumb" /></span>
              <span>Section: {settings.section_enabled ? 'On' : 'Off'}</span>
            </button>
            <button
              type="button"
              role="switch"
              aria-checked={settings.youtube_enabled}
              disabled={setupNeeded || savingSettings || !settings.section_enabled}
              className={'cms-switch' + (settings.youtube_enabled ? ' on' : '')}
              onClick={() => persistSettings({ ...settings, youtube_enabled: !settings.youtube_enabled })}
            >
              <span className="cms-switch-track"><span className="cms-switch-thumb" /></span>
              <span>YouTube: {settings.youtube_enabled ? 'On' : 'Off'}</span>
            </button>
            <button
              type="button"
              role="switch"
              aria-checked={settings.instagram_enabled}
              disabled={setupNeeded || savingSettings || !settings.section_enabled}
              className={'cms-switch' + (settings.instagram_enabled ? ' on' : '')}
              onClick={() => persistSettings({ ...settings, instagram_enabled: !settings.instagram_enabled })}
            >
              <span className="cms-switch-track"><span className="cms-switch-thumb" /></span>
              <span>Instagram: {settings.instagram_enabled ? 'On' : 'Off'}</span>
            </button>
          </div>
        </div>

        <form
          className="vf-admin-meta-form"
          onSubmit={e => {
            e.preventDefault();
            persistSettings(settings);
          }}
        >
          <label>
            Section title
            <input
              value={settings.section_title}
              maxLength={120}
              disabled={setupNeeded}
              onChange={e => setSettings(s => ({ ...s, section_title: e.target.value }))}
              placeholder="Video Feeds"
            />
          </label>
          <label>
            Section subtitle
            <input
              value={settings.section_subtitle}
              maxLength={300}
              disabled={setupNeeded}
              onChange={e => setSettings(s => ({ ...s, section_subtitle: e.target.value }))}
              placeholder="Watch studio reels, student edits, and behind-the-scenes work."
            />
          </label>
          <button type="submit" className="button small" disabled={setupNeeded || savingSettings}>
            <Save size={15} /> {savingSettings ? 'Saving…' : 'Save heading'}
          </button>
        </form>
      </section>

      {/* Platform Switch Tabs (YouTube vs Instagram) */}
      <div className="vf-admin-tabs" role="tablist" aria-label="Video platform">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'youtube'}
          className={tab === 'youtube' ? 'active yt' : ''}
          onClick={() => { setTab('youtube'); setEditId(null); }}
        >
          <Youtube size={17} />
          <span>YouTube Videos</span>
          <small>{ytItems.filter(i => i.enabled).length} / {ytItems.length} on</small>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'instagram'}
          className={tab === 'instagram' ? 'active ig' : ''}
          onClick={() => { setTab('instagram'); setEditId(null); }}
        >
          <Instagram size={17} />
          <span>Instagram Reels &amp; Posts</span>
          <small>{igItems.filter(i => i.enabled).length} / {igItems.length} on</small>
        </button>
      </div>

      {/* Add New Video Form */}
      <section className="vf-admin-card">
        <div className="vf-admin-head">
          <div>
            <h2>{tab === 'youtube' ? 'Add YouTube Video' : 'Add Instagram Reel / Post'}</h2>
            <p>
              {tab === 'youtube'
                ? 'Paste any YouTube watch, youtu.be, or Shorts link. 1 video centers cleanly; 2+ adjust into a responsive grid.'
                : 'Paste any public Instagram Reel or Post link (instagram.com/reel/... or instagram.com/p/...).'}
            </p>
          </div>
        </div>

        <form className="vf-admin-add" onSubmit={handleAdd}>
          <div className="vf-admin-add-grid">
            <label>
              Video title *
              <input
                required
                maxLength={160}
                disabled={setupNeeded || adding}
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={tab === 'youtube' ? 'e.g. Student Showreel 2026' : 'e.g. Behind the Scenes on Set'}
              />
            </label>
            <label>
              {tab === 'youtube' ? 'YouTube link *' : 'Instagram link *'}
              <input
                required
                type="url"
                maxLength={1000}
                disabled={setupNeeded || adding}
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder={tab === 'youtube' ? 'https://www.youtube.com/watch?v=...' : 'https://www.instagram.com/reel/...'}
              />
            </label>
          </div>

          <div className="vf-admin-add-row">
            <label style={{ flex: 1 }}>
              Short caption (optional)
              <input
                maxLength={300}
                disabled={setupNeeded || adding}
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Optional 1-line note shown below the video"
              />
            </label>
            <label className="cms-checkbox" style={{ alignSelf: 'end', paddingBottom: 10 }}>
              <input type="checkbox" checked={enabled} disabled={setupNeeded || adding} onChange={e => setEnabled(e.target.checked)} />
              Show immediately (On)
            </label>
            <button type="submit" className="button" disabled={setupNeeded || adding} style={{ alignSelf: 'end' }}>
              <Plus size={16} /> {adding ? 'Adding…' : tab === 'youtube' ? 'Add YouTube video' : 'Add Instagram reel'}
            </button>
          </div>

          {previewThumb && (
            <div className="vf-admin-preview">
              <img src={previewThumb} alt="" />
              <span>Valid YouTube link detected — thumbnail ready.</span>
            </div>
          )}
          {previewIg && (
            <div className="vf-admin-preview">
              <Instagram size={18} />
              <span>Valid Instagram {previewIg.type === 'reel' ? 'Reel' : 'Post'} detected ({previewIg.code}).</span>
            </div>
          )}
        </form>
      </section>

      {/* Saved Videos List */}
      <section className="vf-admin-card">
        <div className="vf-admin-head">
          <div>
            <h2>{tab === 'youtube' ? `YouTube Videos (${ytItems.length})` : `Instagram Reels & Posts (${igItems.length})`}</h2>
            <p>Toggle individual videos On/Off, edit their title or link, or delete them anytime.</p>
          </div>
        </div>

        {currentItems.length === 0 ? (
          <div className="vf-admin-empty">
            {tab === 'youtube' ? <Youtube size={28} /> : <Instagram size={28} />}
            <p>No {tab === 'youtube' ? 'YouTube videos' : 'Instagram reels'} added yet. Add your first link above.</p>
          </div>
        ) : (
          <div className="vf-admin-list">
            {currentItems.map(item => {
              const isEditing = editId === item.id;
              const thumb = item.platform === 'youtube' ? getYouTubeThumbUrl(item.url) : null;
              const busy = busyId === item.id;

              return (
                <div key={item.id} className={'vf-admin-item' + (!item.enabled ? ' is-off' : '')}>
                  {isEditing ? (
                    <div className="vf-admin-edit">
                      <div className="vf-admin-add-grid">
                        <label>
                          Title
                          <input value={editTitle} maxLength={160} onChange={e => setEditTitle(e.target.value)} />
                        </label>
                        <label>
                          Link
                          <input type="url" value={editUrl} maxLength={1000} onChange={e => setEditUrl(e.target.value)} />
                        </label>
                      </div>
                      <label>
                        Caption
                        <input value={editCaption} maxLength={300} onChange={e => setEditCaption(e.target.value)} />
                      </label>
                      <div className="vf-admin-edit-actions">
                        <button type="button" className="button small" disabled={busy} onClick={() => handleUpdate(item)}>
                          <Save size={14} /> {busy ? 'Saving…' : 'Save changes'}
                        </button>
                        <button type="button" className="button secondary small" disabled={busy} onClick={() => setEditId(null)}>
                          <X size={14} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="vf-admin-item-info">
                        {thumb ? (
                          <img className="vf-admin-thumb" src={thumb} alt="" />
                        ) : (
                          <span className="vf-admin-ig-icon"><Instagram size={20} /></span>
                        )}
                        <div className="vf-admin-item-text">
                          <strong>{item.title}</strong>
                          <small>{item.caption || item.url}</small>
                        </div>
                      </div>

                      <div className="vf-admin-item-actions">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={item.enabled}
                          disabled={busy}
                          className={'cms-switch' + (item.enabled ? ' on' : '')}
                          onClick={() => handleToggle(item)}
                        >
                          <span className="cms-switch-track"><span className="cms-switch-thumb" /></span>
                          <span>{item.enabled ? 'On' : 'Off'}</span>
                        </button>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="act" title="Open link">
                          <ExternalLink size={15} />
                        </a>
                        <button type="button" className="act" title="Edit video" disabled={busy} onClick={() => startEdit(item)}>
                          <Pencil size={15} />
                        </button>
                        <button type="button" className="act danger" title="Delete video" disabled={busy} onClick={() => handleDelete(item)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
