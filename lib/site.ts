// Site-wide content for RAKVIH Digital (from the website brief + "RAKVIH Digital Website Content" PDF).
// Single public brand: RAKVIH Digital. The academy, podcast studio and production are divisions/services under it.
// Placeholders marked TODO still need real details from RAKVIH before publishing.

export const site = {
  name: 'RAKVIH Digital',
  parent: 'A Division of RAKVIH Solutions Pvt. Ltd.',
  tagline: 'Turn Your Creativity Into Your Career.',
  /** Primary brand line from the content PDF. */
  promise: 'Your Creativity. Our Technology. Infinite Possibilities.',
  positioning: 'A unified destination for technology, creative education, media production and professional podcast studio services.',
  campaign: 'Create. Capture. Edit. Inspire.',
  closing: 'Learn the Art. Master the Technology. Create Your Future.',
  location: 'Bengaluru, Karnataka, India',
  /** WhatsApp number that receives every enquiry (digits only, with country code). */
  whatsapp: '918549941515',
  whatsappDisplay: '+91 85499 41515',
  email: '', // TODO: official email (hidden on the site until set)
  website: '', // TODO: website domain (hidden on the site until set)
  social: [ // TODO: placeholder links — replace with the real RAKVIH Digital profiles
    { label: 'Instagram', href: 'https://www.instagram.com/' },
    { label: 'Facebook', href: 'https://www.facebook.com/' },
    { label: 'YouTube', href: 'https://www.youtube.com/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
  ],
};

export const nav = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/courses', label: 'Courses' },
  { href: '/podcast-studio', label: 'Podcast Studio' },
  { href: '/production', label: 'Production' },
  { href: '/projects', label: 'Student Work' },
  { href: '/careers', label: 'Careers' },
  { href: '/contact', label: 'Contact' },
];

export const offers = [
  { icon: 'graduation', title: 'Professional Training', text: 'Learn video editing, cinematography, photography, filmmaking, lighting, sound engineering, motion graphics, digital content creation and creative production.', href: '/courses' },
  { icon: 'mic', title: 'Premium Podcast Studio', text: 'Experience a professionally equipped podcast space for interviews, business discussions, video podcasts, audio podcasts and content production.', href: '/podcast-studio' },
  { icon: 'film', title: 'Practical Industry Experience', text: 'Work on real-world projects, short films, promotional videos, photography assignments and digital content.', href: '/projects' },
  { icon: 'sparkles', title: 'Creative Production Services', text: 'Get professional video editing, photography, cinematography, podcast production, promotional videos, event coverage and digital content production.', href: '/production' },
  { icon: 'monitor', title: 'Digital Technology Solutions', text: 'Website development, software solutions, digital marketing and technology services through RAKVIH Digital.', href: '/contact' },
];

export const mission = [
  'Deliver practical and industry-oriented training.',
  'Develop skilled video editors, cinematographers and content creators.',
  'Encourage creative thinking and storytelling.',
  'Provide access to professional production facilities.',
  'Support students in building portfolios, career readiness and career opportunities.',
  'Create opportunities for aspiring filmmakers and digital creators to work on real creative projects.',
];

export const whyUs = [
  { icon: 'hand', title: 'Practical-oriented learning' },
  { icon: 'camera', title: 'Professional equipment exposure' },
  { icon: 'award', title: 'Experienced industry trainers' },
  { icon: 'user', title: 'Individual attention' },
  { icon: 'film', title: 'Hands-on production assignments' },
  { icon: 'mic', title: 'Premium podcast studio access' },
  { icon: 'globe', title: 'Real-world creative projects' },
  { icon: 'folder', title: 'Portfolio development' },
  { icon: 'monitor', title: 'Industry-relevant software training' },
  { icon: 'calendar', title: 'Flexible learning opportunities' },
];

export const studioFacilities = [
  'Premium podcast recording setup', 'Professional microphones', 'Multi-camera video recording', 'Professional lighting arrangements',
  'Acoustic treatment', 'Comfortable recording environment', 'Video podcast production', 'Audio recording facilities',
  'Interview and discussion setup', 'Professional editing support',
];
export const studioAudience = [
  'Podcast creators', 'Entrepreneurs and business owners', 'Corporate companies', 'YouTubers and influencers',
  'Coaches and trainers', 'Educational institutions', 'Interviewers and content creators', 'Marketing and advertising agencies',
];
export const podcastServices = [
  'Podcast studio rental', 'Audio podcast recording', 'Video podcast recording', 'Multi-camera podcast production', 'Podcast editing',
  'Audio mixing and mastering', 'YouTube podcast production', 'Interview recording', 'Corporate podcast production', 'Complete podcast production packages',
];

export const productionServices = [
  { icon: 'building', title: 'Corporate promotional videos' },
  { icon: 'package', title: 'Product advertisements' },
  { icon: 'sparkles', title: 'Brand videos and brand films' },
  { icon: 'party', title: 'Event videography and photography' },
  { icon: 'heart', title: 'Wedding cinematography' },
  { icon: 'camera', title: 'Photography services' },
  { icon: 'youtube', title: 'YouTube video production' },
  { icon: 'mic', title: 'Podcast production' },
  { icon: 'smartphone', title: 'Social media reels' },
  { icon: 'clapperboard', title: 'Documentary production' },
  { icon: 'scissors', title: 'Video editing services' },
  { icon: 'image', title: 'Commercial photography' },
];

export const projectTypes = [
  'Short films', 'Product advertisements', 'Promotional videos', 'Photography portfolios',
  'Video podcasts', 'Interviews', 'Documentary projects', 'Social media content',
];

export const careers = [
  'Video Editor', 'Cinematographer', 'Camera Operator', 'Photographer', 'Film Production Assistant', 'Assistant Director',
  'Motion Graphics Designer', 'Content Creator', 'Podcast Producer', 'Video Production Executive', 'Freelance Video Creator', 'Digital Media Professional',
];

export const studioOptions = ['Podcast studio rental', 'Audio podcast recording', 'Video podcast recording', 'Multi-camera podcast production', 'Complete podcast production package'];
export const productionOptions = productionServices.map(s => s.title);
export const learningModes = ['Weekday batch', 'Weekend batch', 'Flexible / one-to-one', 'Not sure yet'];

export const enquiryTypes = {
  admission: 'Course admission',
  studio: 'Podcast studio booking',
  production: 'Production services',
  general: 'General enquiry',
} as const;
export type EnquiryType = keyof typeof enquiryTypes;

/** Build the wa.me link used by every enquiry form. */
export function whatsappLink(text: string, number = site.whatsapp) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
