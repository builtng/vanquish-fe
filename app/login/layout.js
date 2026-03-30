import { generateMetadata as genMeta } from '@/lib/seo';

export const metadata = genMeta({
  title: 'Admin Login | Therapy Management Dashboard',
  description: 'Sign in to access the Vanquish admin dashboard for therapy management and client booking administration.',
  keywords: ['admin login', 'therapy management dashboard', 'admin portal', 'therapy administration'],
  url: '/login',
  noindex: true, // Login pages typically shouldn't be indexed
});

export default function LoginLayout({ children }) {
  return children;
}

