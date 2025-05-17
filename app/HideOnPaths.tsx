"use client";

import { usePathname } from "next/navigation";

interface HideOnPathsProps {
  pathStarts: string[];
  excludePaths?: string[]; // Add this prop for paths to exclude from hiding
  children: React.ReactNode;
}

export default function HideOnPaths({
  pathStarts,
  excludePaths = [],
  children,
}: HideOnPathsProps) {
  const pathname = usePathname();

  // First check if path is in exclusions
  if (excludePaths.some((path) => pathname === path)) {
    return <>{children}</>;
  }

  // Then check if it should be hidden
  const shouldHide = pathStarts.some((start) => pathname.startsWith(start));

  if (shouldHide) {
    return null;
  }

  return <>{children}</>;
}