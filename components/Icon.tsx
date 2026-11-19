import {
  Scissors, Video, Camera, Clapperboard, Wand2, Lightbulb, Smartphone, Cpu, GraduationCap, Mic, Film, Sparkles,
  Hand, Award, User, Globe, FolderOpen, Monitor, CalendarDays, Building2, Package, PartyPopper, Heart, Youtube, Image as ImageIcon, Users, MessageCircle, MapPin, Briefcase, Compass, Hammer, Handshake, Eye, Target, Clock, Headphones, ShieldCheck,
  type LucideProps,
} from 'lucide-react';

const map = {
  scissors: Scissors, video: Video, camera: Camera, clapperboard: Clapperboard, wand: Wand2, lightbulb: Lightbulb,
  smartphone: Smartphone, cpu: Cpu, graduation: GraduationCap, mic: Mic, film: Film, sparkles: Sparkles, hand: Hand,
  award: Award, user: User, globe: Globe, folder: FolderOpen, monitor: Monitor, calendar: CalendarDays, building: Building2,
  package: Package, party: PartyPopper, heart: Heart, youtube: Youtube, image: ImageIcon,
  users: Users, message: MessageCircle, map: MapPin, briefcase: Briefcase, compass: Compass, hammer: Hammer, handshake: Handshake,
  eye: Eye, target: Target, clock: Clock, headphones: Headphones, shield: ShieldCheck,
};

export default function Icon({ name, ...props }: { name: string } & LucideProps) {
  const C = map[name as keyof typeof map] ?? Sparkles;
  return <C strokeWidth={1.7} {...props} />;
}
