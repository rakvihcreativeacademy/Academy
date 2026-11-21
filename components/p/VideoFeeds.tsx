'use client';
import { useState } from 'react';
import { ArrowUpRight, Instagram, Play, Youtube } from 'lucide-react';
import Words from '@/components/v/Words';
import {
  getYouTubeEmbedUrl,
  getYouTubeThumbUrl,
  isYouTubeShort,
  parseInstagramMedia,
  type VideoFeedItem,
} from '@/lib/video-feeds';
import type { PublicVideoFeeds } from '@/lib/video-feeds-server';

function YouTubeCard({ item }: { item: VideoFeedItem }) {
  const [playing, setPlaying] = useState(false);
  const embed = getYouTubeEmbedUrl(item.url);
  const thumb = getYouTubeThumbUrl(item.url);
  const isShort = isYouTubeShort(item.url);
  if (!embed) return null;

  return (
    <article className={'vf-card vf-yt-card' + (isShort ? ' is-short' : '')} data-v>
      <div className="vf-media">
        {playing ? (
          <iframe
            src={`${embed}&autoplay=1`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button type="button" className="vf-poster" onClick={() => setPlaying(true)} aria-label={`Play ${item.title}`}>
            {thumb && <img src={thumb} alt={item.title} loading="lazy" />}
            <span className="vf-poster-shade" aria-hidden="true" />
            <span className="vf-play" aria-hidden="true">
              <Play size={22} fill="currentColor" />
            </span>
          </button>
        )}
      </div>
      <div className="vf-card-body">
        <div className="vf-card-meta">
          <span className="vf-badge yt"><Youtube size={13} /> YouTube</span>
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="vf-ext" aria-label={`Watch ${item.title} on YouTube`}>
            Watch <ArrowUpRight size={13} />
          </a>
        </div>
        <h3>{item.title}</h3>
        {item.caption && <p>{item.caption}</p>}
      </div>
    </article>
  );
}

function InstagramCard({ item }: { item: VideoFeedItem }) {
  const media = parseInstagramMedia(item.url);
  if (!media) return null;

  return (
    <article className="vf-card vf-ig-card" data-v>
      <div className="vf-ig-frame">
        <iframe
          src={media.embedUrl}
          title={item.title}
          loading="lazy"
          allowTransparency
          scrolling="no"
        />
      </div>
      <div className="vf-card-body">
        <div className="vf-card-meta">
          <span className="vf-badge ig"><Instagram size={13} /> Instagram</span>
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="vf-ext" aria-label={`Open ${item.title} on Instagram`}>
            Open <ArrowUpRight size={13} />
          </a>
        </div>
        <h3>{item.title}</h3>
        {item.caption && <p>{item.caption}</p>}
      </div>
    </article>
  );
}

function gridClass(count: number) {
  if (count === 1) return 'one';
  if (count === 2) return 'two';
  return 'many';
}

export default function VideoFeeds({ feeds, label }: { feeds: PublicVideoFeeds; label: string }) {
  const { settings, youtube, instagram } = feeds;
  if (!settings.section_enabled) return null;
  if (youtube.length === 0 && instagram.length === 0) return null;

  const hasBoth = youtube.length > 0 && instagram.length > 0;

  return (
    <section className="pm-sec pm-dark vf-sec" id="video-feeds" data-dark>
      <div className="pm-wrap">
        <div className="pm-head-row">
          <div data-v>
            <p className="pm-label rule">{label} — <b>{settings.section_title || 'Video Feeds'}</b></p>
            <h2 className="pm-h2">
              <Words text="Watch our" /> <em><Words text="latest reels & films." start={2} /></em>
            </h2>
          </div>
          {settings.section_subtitle && <p className="pm-lede">{settings.section_subtitle}</p>}
        </div>

        {youtube.length > 0 && (
          <div className="vf-group">
            {hasBoth && (
              <div className="vf-group-head">
                <span className="vf-group-pill yt"><Youtube size={14} /> YouTube</span>
              </div>
            )}
            <div className={`vf-grid ${gridClass(youtube.length)}`}>
              {youtube.map(item => <YouTubeCard key={item.id} item={item} />)}
            </div>
          </div>
        )}

        {instagram.length > 0 && (
          <div className="vf-group">
            {hasBoth && (
              <div className="vf-group-head">
                <span className="vf-group-pill ig"><Instagram size={14} /> Instagram</span>
              </div>
            )}
            <div className={`vf-ig-grid ${gridClass(instagram.length)}`}>
              {instagram.map(item => <InstagramCard key={item.id} item={item} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
