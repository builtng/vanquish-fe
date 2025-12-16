import { generateMetadata as genMeta } from '@/lib/seo';

export const metadata = genMeta({
  title: 'Apply as Qualified Counsellor | Professional Therapist Registration',
  description: 'Apply as a qualified counsellor to join the Vanquish network. Connect with clients and provide professional mental health support across the UK.',
  keywords: ['qualified counsellor application', 'professional therapist registration', 'counsellor jobs', 'mental health professional', 'therapist application uk', 'qualified counsellor uk'],
  url: '/qualified-counsellor-form',
});

export default function QualifiedCounsellorFormLayout({ children }) {
  return children;
}

