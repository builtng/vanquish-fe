"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InboxRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/counsellor-portal/messages?folder=inbox");
  }, [router]);
  return null;
}
