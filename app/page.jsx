import { generateMetadata as genMeta } from "@/lib/seo";
import LoginPage from "@/components/LoginPage";

export const metadata = genMeta({
  title: "Admin Login | Therapy Management Dashboard",
  description:
    "Sign in to access the Vanquish admin dashboard for therapy management and client booking administration.",
  keywords: [
    "admin login",
    "therapy management dashboard",
    "admin portal",
    "therapy administration",
  ],
  url: "/",
  noindex: true,
});

export default function HomePage() {
  return <LoginPage />;
}