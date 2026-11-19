// All RAKVIH Digital courses (website brief + content PDF).
export type Course = {
  slug: string; title: string; tag: string; symbol: string; icon: string;
  description: string; skills: string[]; modules: string[];
};

export const courses: Course[] = [
  {
    slug: 'video-editing', symbol: '01', icon: 'scissors', tag: 'Post-production', title: 'Professional Video Editing',
    description: 'Find the story in every frame. Turn raw footage into work that moves people.',
    skills: ['Premiere Pro', 'DaVinci Resolve', 'Final Cut Pro'],
    modules: ['Adobe Premiere Pro', 'DaVinci Resolve', 'Final Cut Pro', 'Video editing techniques', 'Transitions and pacing', 'Colour correction and grading', 'Audio synchronization and sound editing', 'Reels and YouTube editing', 'Wedding and commercial editing'],
  },
  {
    slug: 'cinematography', symbol: '02', icon: 'video', tag: 'Behind the lens', title: 'Cinematography & Camera Handling',
    description: 'See differently. Master exposure, composition, camera movement and visual storytelling.',
    skills: ['Cinema cameras', 'Lenses', 'Gimbal'],
    modules: ['DSLR and mirrorless camera operation', 'Cinema camera handling', 'Camera settings, exposure and focus', 'Lens selection', 'Composition and framing', 'Camera movements', 'Tripod and gimbal operation', 'Professional shooting techniques', 'Indoor and outdoor shooting techniques'],
  },
  {
    slug: 'photography', symbol: '03', icon: 'camera', tag: 'Capture the moment', title: 'Professional Photography',
    description: 'Build your eye for light, people and products. Create images with intention.',
    skills: ['Portraits', 'Product', 'Studio lighting'],
    modules: ['Camera fundamentals', 'Portrait photography', 'Product photography', 'Event photography', 'Wedding photography', 'Studio photography', 'Lighting techniques', 'Photo editing using Lightroom and Photoshop'],
  },
  {
    slug: 'filmmaking', symbol: '04', icon: 'clapperboard', tag: 'Script to screen', title: 'Filmmaking & Direction',
    description: 'Bring your ideas to life, from the very first storyboard to the final cut.',
    skills: ['Scriptwriting', 'Direction', 'Short films'],
    modules: ['Story development', 'Scriptwriting', 'Storyboarding', 'Film direction', 'Shot planning and scene composition', 'Short film production', 'Documentary filmmaking', 'Production management', 'Production planning and on-set workflow'],
  },
  {
    slug: 'motion-graphics', symbol: '05', icon: 'wand', tag: 'Make it move', title: 'Motion Graphics & Visual Effects',
    description: 'Design in motion. Create expressive titles, visual effects and brand animations.',
    skills: ['After Effects', 'Logo animation', 'Green screen'],
    modules: ['Adobe After Effects', 'Motion graphics', 'Logo animation', 'Title animation', 'Green screen editing', 'Visual effects fundamentals'],
  },
  {
    slug: 'lighting-sound', symbol: '06', icon: 'lightbulb', tag: 'Set the atmosphere', title: 'Lighting & Sound Production',
    description: 'Shape the mood. Craft intentional light and clear, compelling sound.',
    skills: ['Studio lighting', 'Microphones', 'Mixing'],
    modules: ['Studio lighting', 'Natural lighting', 'LED lighting', 'Microphone handling', 'Audio recording', 'Sound editing and mixing', 'Noise reduction'],
  },
  {
    slug: 'content-creation', symbol: '07', icon: 'smartphone', tag: 'Create for the now', title: 'Digital Content Creation',
    description: 'Create content that connects. Build a practical workflow for digital platforms.',
    skills: ['Reels', 'YouTube', 'Brand videos'],
    modules: ['Instagram Reels production', 'YouTube video production', 'Influencer content', 'Corporate videos', 'Product advertisements', 'Social media video creation'],
  },
  {
    slug: 'ai-creative', symbol: '08', icon: 'cpu', tag: 'The next toolkit', title: 'AI for Creative Professionals',
    description: 'Expand what’s possible with AI-assisted creative tools and production workflows.',
    skills: ['AI video', 'AI images', 'AI voiceovers'],
    modules: ['AI-assisted editing', 'AI video generation', 'AI image generation', 'AI voiceovers', 'AI subtitles and captions', 'AI-powered content workflows'],
  },
];
