import { generateMetadata as genMeta } from '@/lib/seo';

export const metadata = genMeta({
  title: 'Therapy Intake Form | Start Your Counselling Journey Today',
  description: 'Complete your client intake form to begin your therapy journey. Provide information about your needs and preferences to be matched with the right counsellor.',
  keywords: ['therapy intake form', 'counselling intake', 'therapy registration', 'mental health assessment', 'therapy application', 'client intake form'],
  url: '/clform',
});

export default function ClientFormLayout({ children }) {
  return children;
}

