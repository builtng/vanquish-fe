"use client";

import React from "react";

export default function BuildIdentifier({ className = "" }) {
  const buildInfo =
    process.env.NEXT_PUBLIC_BUILD_IDENTIFIER || "Build unknown";

  return (
    <div
      data-testid="build-identifier"
      className={`text-xs text-gray-400 dark:text-gray-500 font-mono tracking-tight text-center py-2 select-none ${className}`}
    >
      {buildInfo}
    </div>
  );
}
