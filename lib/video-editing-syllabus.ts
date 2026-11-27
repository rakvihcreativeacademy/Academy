export type SyllabusDay = {
  day: string;
  module: string;
  topics: string[];
  deliverable: string;
};

export const VIDEO_EDITING_SYLLABUS_META = {
  eyebrow: 'Adobe Premiere Pro Course Syllabus',
  title: '12-Day Class Schedule',
  subtitle: 'Comprehensive Video Editing Curriculum & Project-Based Training',
  intro:
    'This 12-day instructional roadmap structures all core modules, technical post-production pipelines, and advanced Creative Cloud workflows into daily hands-on sessions.',
  pacingNote:
    'Modules 1 through 7 are paced at one module per day (Days 1–7), Module 8 spans Days 8 and 9 for comprehensive visual effects and multicam labs, and Days 10 through 12 focus entirely on mastering delivery codecs, proxy/batch pipelines, and cross-application Creative Cloud integration.',
  highlights: [
    '45-Day Training Program',
    'Live Project Training with Trainer Assistance',
    'Get Training Certificate in 45 Days',
  ],
};

export const VIDEO_EDITING_SYLLABUS: SyllabusDay[] = [
  {
    day: 'Day 1',
    module: 'Module 1: Introduction to Premiere Pro',
    topics: [
      'What is Premiere Pro?',
      'System requirements & installation',
      'Understanding the workspace',
      'Creating and managing projects',
      'Importing media files',
    ],
    deliverable: 'Initialize a structured project directory and import raw media assets cleanly.',
  },
  {
    day: 'Day 2',
    module: 'Module 2: Premiere Pro Interface & Tools',
    topics: [
      'Panels overview: Project, Timeline, Program, Source Monitor',
      'Customizing workspace',
      'Tool panel: Selection, Razor, Slip, Slide, Hand, Pen, Rate Stretch',
      'Keyboard shortcuts for speed editing',
    ],
    deliverable: 'Configure a custom editing workspace and complete a shortcut speed drill.',
  },
  {
    day: 'Day 3',
    module: 'Module 3: Timeline Editing Basics',
    topics: [
      'Creating sequences & working with video/audio tracks',
      'In and Out points; insert, overwrite, ripple delete',
      'Moving, trimming, and splitting clips',
      'Snapping, locking, and enabling/disabling clips',
    ],
    deliverable: 'Assemble a clean multi-clip rough cut using three-point editing techniques.',
  },
  {
    day: 'Day 4',
    module: 'Module 4: Transitions & Effects',
    topics: [
      'Video transitions (cross dissolve, dip to black, etc.)',
      'Audio transitions (constant power, exponential fade)',
      'Using the Effects panel and search',
      'Keyframing motion effects: position, scale, opacity, rotation',
    ],
    deliverable: 'Apply seamless scene transitions and build a keyframed motion sequence.',
  },
  {
    day: 'Day 5',
    module: 'Module 5: Working with Titles & Graphics',
    topics: [
      'Using the Essential Graphics Panel',
      'Creating and customizing titles, lower thirds, and animated text',
      'Importing title templates (MOGRT files)',
      'Animating text with keyframes',
    ],
    deliverable: 'Design a custom lower third and integrate an animated MOGRT title package.',
  },
  {
    day: 'Day 6',
    module: 'Module 6: Audio Editing',
    topics: [
      'Audio track types: standard, mono, stereo',
      'Adjusting volume, gain, and fade',
      'Audio effects: EQ, DeNoise, Reverb',
      'Audio keyframing, ducking, and syncing audio with video',
    ],
    deliverable: 'Clean up dialogue tracks and balance background music under voiceover using ducking.',
  },
  {
    day: 'Day 7',
    module: 'Module 7: Color Correction & Grading',
    topics: [
      'Using Lumetri Color Panel',
      'Basic correction: exposure, contrast, highlights, shadows, saturation',
      'Working with LUTs & matching colors between shots',
      'Vignette and creative looks',
    ],
    deliverable: 'Balance exposure across multi-shot footage and apply a consistent creative color grade.',
  },
  {
    day: 'Day 8',
    module: 'Module 8: Advanced Editing Techniques (Part 1)',
    topics: [
      'Multicam editing',
      'Nesting sequences',
      'Speed/duration effects: slow motion, fast forward, reverse',
      'Freeze frames and time remapping',
    ],
    deliverable: 'Sync and edit a multi-camera sequence enhanced with dynamic speed ramps.',
  },
  {
    day: 'Day 9',
    module: 'Module 8: Advanced Editing Techniques (Part 2)',
    topics: [
      'Green screen (Chroma Keying with Ultra Key)',
      'Masking and tracking',
      'Rotoscoping & feathered matte refinements',
    ],
    deliverable: 'Composite a green-screen subject and execute a tracked mask effect.',
  },
  {
    day: 'Day 10',
    module: 'Module 9: Exporting & Delivery Standards',
    topics: [
      'Format & codec options (MP4, MOV, H.264, ProRes, etc.)',
      'Presets for YouTube, Instagram, Vimeo (4K, Full HD, mobile)',
      'Bitrate settings (CBR vs. VBR) for quality and file size control',
      'Captions, subtitles (SRT), and social media aspect ratios',
    ],
    deliverable: 'Export calibrated masters and social aspect-ratio deliverables with burned-in captions.',
  },
  {
    day: 'Day 11',
    module: 'Module 10: Proxy Workflows & Batch Rendering',
    topics: [
      'Working with proxies for smooth 4K/8K editing',
      'Using Adobe Media Encoder for batch export & watch folders',
      'Building reusable custom ingest and export templates',
      'Project archiving, media consolidation, and scratch disk management',
    ],
    deliverable: 'Set up a proxy editing pipeline and configure automated batch renders via Media Encoder.',
  },
  {
    day: 'Day 12',
    module: 'Module 11: Creative Cloud Integration & Pro Workflows',
    topics: [
      'Dynamic Link integration with After Effects and Photoshop',
      'Creative customization and rigging of MOGRT templates',
      'Adjustment layers, nested presets, and XML/EDL round-tripping',
      'Freelance editing workflows, client review tools, and delivery checklists',
    ],
    deliverable: 'Round-trip a sequence through After Effects and Photoshop and package a client-ready template.',
  },
];
