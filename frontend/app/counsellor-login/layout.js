import { generateMetadata as genMeta } from "@/lib/seo";

export const metadata = genMeta({
  title: "Counsellor Login | Vanquish Therapy",
  description:
    "Sign in to your counsellor portal to manage your clients, sessions, and messages.",
  keywords: [
    "counsellor login",
    "therapist login",
    "counsellor portal",
    "therapy management",
  ],
  url: "/counsellor-login",
  noindex: true,
});

export default function CounsellorLoginLayout({ children }) {
  return children;
}
