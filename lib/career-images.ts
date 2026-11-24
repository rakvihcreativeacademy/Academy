/** Role-specific artwork: each career keeps its own image even when cards are reordered. */
export const careerImages: Record<string, string> = {
  'video editor': '/images/banners/editing-colour.webp',
  cinematographer: '/images/course-cinematography.webp',
  'camera operator': '/images/careers/camera-operator.webp',
  photographer: '/images/academy-photography.webp',
  'film production assistant': '/images/careers/film-production-assistant.webp',
  'assistant director': '/images/careers/assistant-director.webp',
  'motion graphics designer': '/images/course-motion-graphics.webp',
  'content creator': '/images/course-content-creation.webp',
  'podcast producer': '/images/academy-studio.webp',
  'video production executive': '/images/careers/video-production-executive.webp',
  'freelance video creator': '/images/careers/freelance-video-creator.webp',
  'digital media professional': '/images/course-ai-creative.webp',
  'portfolio development': '/images/careers/portfolio-development.webp',
  'practical project experience': '/images/careers/practical-project-experience.webp',
  'career guidance': '/images/careers/career-guidance.webp',
  'placement assistance': '/images/careers/placement-assistance.webp',
};
export function careerImage(title: string) {
  return careerImages[title.trim().toLowerCase()];
}
