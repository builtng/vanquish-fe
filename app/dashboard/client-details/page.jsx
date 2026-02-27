"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function IndividualClientDetailPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard/clients");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
