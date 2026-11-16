import { generateMetadata as genMeta } from '@/lib/seo';

export const metadata = genMeta({
  title: 'Counsellor Portal (read-only view)',
  description: 'Read-only view of a counsellor portal for administrators.',
  url: '/portal-view',
  noindex: true,
});

export default function PortalViewLayout({ children }) {
  return children;
}
