import ManagedPage from '@/components/ManagedPage';
export const metadata={title:'Podcast Studio'};
// Cached and refreshed on publish (revalidatePath) or every 5 minutes.
export const revalidate=300;
export default function Page(){return <ManagedPage page="podcast-studio"/>;}
