import { generateMetadata as genMeta } from '@/lib/seo';

export const metadata = genMeta({
  title: 'Apply as Trainee Counsellor | Join UK Therapy Network',
  description: 'Apply to become a trainee counsellor with Vanquish. Join our network of qualified mental health professionals and start your counselling career.',
  keywords: ['trainee counsellor application', 'therapist application', 'counsellor jobs uk', 'join therapy network', 'counsellor registration', 'mental health jobs'],
  url: '/tcform',
});

export default function TCFormLayout({ children }) {
  return children;
}

