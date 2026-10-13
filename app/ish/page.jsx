import { redirect } from "next/navigation";

export default function IshRedirectPage() {
  redirect("/mid-range-intake?service=coaching");
}
