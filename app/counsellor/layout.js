import { generateMetadata as genMeta } from '@/lib/seo';

export const metadata = genMeta({
  title: 'Counsellor Portal | Access Your Therapy Dashboard',
  description: 'Access your counsellor portal to view messages, manage clients, and see upcoming therapy sessions.',
  keywords: ['counsellor portal', 'therapist portal', 'therapy management', 'counsellor dashboard', 'therapy sessions'],
  url: '/counsellor',
  noindex: true, // Private portal, shouldn't be indexed
});

export default function CounsellorLayout({ children }) {
  return children;
}

