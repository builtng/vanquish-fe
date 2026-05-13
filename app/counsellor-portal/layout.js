import { generateMetadata as genMeta } from '@/lib/seo';

export const metadata = genMeta({
  title: 'Counsellor Portal',
  description: 'Access your counsellor portal to view messages, manage clients, and see upcoming therapy sessions.',
  keywords: ['counsellor portal', 'therapist portal', 'therapy management', 'counsellor dashboard'],
  url: '/counsellor-portal',
  noindex: true, // Private portal, shouldn't be indexed
});

export default function CounsellorPortalLayout({ children }) {
  return children;
}

