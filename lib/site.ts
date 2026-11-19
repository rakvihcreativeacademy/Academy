// Site-wide content for RAKVIH Creative Academy (from the website brief).
// Placeholders marked TODO still need real details from RAKVIH before publishing.

export const site = {
  name: 'RAKVIH Creative Academy',
  parent: 'A Division of RAKVIH Digital · RAKVIH Solutions Pvt. Ltd.',
  tagline: 'Turn Your Creativity Into Your Career.',
  campaign: 'Create. Capture. Edit. Inspire.',
  closing: 'Learn the Art. Master the Technology. Create Your Future.',
  location: 'Bengaluru, Karnataka, India',
  /** WhatsApp number that receives every enquiry (digits only, with country code). */
  whatsapp: '918296392047',
  whatsappDisplay: '+91 82963 92047',
  email: '', // TODO: official academy email
  website: '', // TODO: academy website domain
  social: [ // TODO: replace with real profile links
    { label: 'Instagram', href: '' },
    { label: 'Facebook', href: '' },
    { label: 'YouTube', href: '' },
    { label: 'LinkedIn', href: '' },
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
  { icon: 'graduation', title: 'Professional Training', text: 'Learn video editing, cinematography, photography, filmmaking, lighting, sound engineering and creative production.', href: '/courses' },
  { icon: 'mic', title: 'Premium Podcast Studio', text: 'A professionally equipped podcast space for interviews, business discussions, video podcasts and content production.', href: '/podcast-studio' },
  { icon: 'film', title: 'Practical Industry Experience', text: 'Work on real-world projects, short films, promotional videos, photography assignments and digital content.', href: '/projects' },
  { icon: 'sparkles', title: 'Creative Production Services', text: 'Professional video editing, photography, cinematography, podcast production and promotional video services.', href: '/production' },
];

export const mission = [
  'Deliver practical and industry-oriented training.',
  'Develop skilled video editors and cinematographers.',
  'Encourage creative thinking and storytelling.',
  'Provide access to professional production facilities.',
  'Support students in building portfolios and career opportunities.',
  'Create opportunities for aspiring filmmakers and digital creators.',
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
  { icon: 'sparkles', title: 'Brand videos' },
  { icon: 'party', title: 'Event videography' },
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
  'Video Editor', 'Cinematographer', 'Camera Operator', 'Photographer', 'Film Assistant', 'Assistant Director',
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
