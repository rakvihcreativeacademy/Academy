/** Title-based artwork keeps production images correct when CMS items are reordered. */
const productionImages: Record<string, string> = {
  'Corporate promotional videos': '/images/production/corporate-video.webp',
  'Product advertisements': '/images/production/product-advertisement.webp',
  'Brand videos and brand films': '/images/production/brand-film.webp',
  'Event videography and photography': '/images/production/event-coverage.webp',
  'Wedding cinematography': '/images/production/wedding-film.webp',
  'Photography services': '/images/academy-photography.webp',
  'YouTube video production': '/images/podcast/youtubers-influencers.webp',
  'Podcast production': '/images/podcast/multi-camera.webp',
  'Social media reels': '/images/production/social-reels.webp',
  'Documentary production': '/images/production/documentary.webp',
  'Video editing services': '/images/academy-editing.webp',
  'Commercial photography': '/images/production/commercial-photo.webp',
  'Share your idea': '/images/production/share-idea.webp',
  'Plan together': '/images/production/plan-together.webp',
  'Shoot & edit': '/images/production/shoot-edit.webp',
  'Deliver': '/images/production/deliver.webp',
};

export function productionItemImage(title: string, customImage?: string) {
  const mapped = productionImages[title];
  // Preserve intentional admin uploads while upgrading the original generic stock.
  const genericStock = /^\/images\/(?:academy-|course-|careers\/)/.test(customImage || '');
  return customImage && !genericStock ? customImage : mapped || customImage || '';
}
