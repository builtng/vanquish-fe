import { generateMetadata as genMeta } from '@/lib/seo';

export const metadata = genMeta({
  title: 'Book Therapy Session Online | UK Counsellors Available Now',
  description: 'Book your therapy session with qualified counsellors. Choose from available time slots and book single sessions or blocks. Secure booking system for mental health support.',
  keywords: ['book therapy', 'therapy sessions', 'counselling booking', 'mental health', 'therapy appointment', 'book counsellor', 'online therapy uk', 'counsellor booking'],
  url: '/client-booking',
});

export default function ClientBookingLayout({ children }) {
  return children;
}

