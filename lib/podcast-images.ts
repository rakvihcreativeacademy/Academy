/** Podcast-specific artwork; never rotate in unrelated course or career photographs. */
export const podcastArtwork = {
  room: '/images/academy-studio.webp',
  microphones: '/images/podcast/microphones.webp',
  cameras: '/images/podcast/multi-camera.webp',
  lighting: '/images/podcast/studio-lighting.webp',
  acoustics: '/images/podcast/acoustic-treatment.webp',
  interview: '/images/podcast/interview-session.webp',
  audio: '/images/podcast/audio-recording.webp',
  editing: '/images/podcast/editing-suite.webp',
  business: '/images/podcast/business-session.webp',
  comfort: '/images/podcast/comfortable-environment.webp',
  production: '/images/podcast/video-production.webp',
  corporate: '/images/podcast/corporate-companies.webp',
  youtube: '/images/podcast/youtubers-influencers.webp',
  education: '/images/podcast/educational-institutions.webp',
  interviewer: '/images/podcast/interviewers-creators.webp',
  agency: '/images/podcast/marketing-agencies.webp',
};
const titles: Record<string, string> = {
  'premium podcast recording setup': podcastArtwork.room,
  'professional microphones': podcastArtwork.microphones,
  'multi-camera video recording': podcastArtwork.cameras,
  'professional lighting arrangements': podcastArtwork.lighting,
  'acoustic treatment': podcastArtwork.acoustics,
  'comfortable recording environment': podcastArtwork.comfort,
  'video podcast production': podcastArtwork.production,
  'audio recording facilities': podcastArtwork.audio,
  'interview and discussion setup': podcastArtwork.interview,
  'professional editing support': podcastArtwork.editing,
  'podcast creators': podcastArtwork.interview,
  'entrepreneurs and business owners': podcastArtwork.business,
  'corporate companies': podcastArtwork.corporate,
  'youtubers and influencers': podcastArtwork.youtube,
  'coaches and trainers': podcastArtwork.audio,
  'educational institutions': podcastArtwork.education,
  'interviewers and content creators': podcastArtwork.interviewer,
  'marketing and advertising agencies': podcastArtwork.agency,
  'podcast studio rental': podcastArtwork.room,
  'audio podcast recording': podcastArtwork.audio,
  'video podcast recording': podcastArtwork.cameras,
  'multi-camera podcast production': podcastArtwork.cameras,
  'podcast editing': podcastArtwork.editing,
  'audio mixing and mastering': podcastArtwork.editing,
  'youtube podcast production': podcastArtwork.cameras,
  'interview recording': podcastArtwork.interview,
  'corporate podcast production': podcastArtwork.business,
  'complete podcast production packages': podcastArtwork.room,
};
export function podcastImage(title: string): string {
  const key=title.trim().toLowerCase();
  if(titles[key])return titles[key];
  if(/edit|mix|master|post.production/.test(key))return podcastArtwork.editing;
  if(/acoustic|soundproof/.test(key))return podcastArtwork.acoustics;
  if(/light/.test(key))return podcastArtwork.lighting;
  if(/microphone/.test(key))return podcastArtwork.microphones;
  if(/camera|video|youtube/.test(key))return podcastArtwork.cameras;
  if(/audio|voice/.test(key))return podcastArtwork.audio;
  if(/business|corporate|marketing|entrepreneur/.test(key))return podcastArtwork.business;
  if(/guest|interview|creator|coach|education|discussion/.test(key))return podcastArtwork.interview;
  return podcastArtwork.room;
}
export function podcastItemImage(title: string, customImage?: string) {
  // Replace the old rotating stock library while preserving intentional admin uploads.
  const legacyStock=customImage && (/^\/images\/(?:academy-(?!studio\b)[\w-]+|course-[\w-]+)\.webp$/.test(customImage) || customImage.startsWith('/images/careers/') || (customImage.startsWith('/images/podcast/') && Object.values(podcastArtwork).includes(customImage) && customImage !== podcastImage(title)) || (customImage === podcastArtwork.room && podcastImage(title) !== podcastArtwork.room));
  return customImage && !legacyStock ? customImage : podcastImage(title);
}
