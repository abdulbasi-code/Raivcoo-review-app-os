// Loading.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { HelpCircle } from "lucide-react";

import Link from "next/link";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Minimal Header */}
      <header className="border-b p-4">
        <div className="container max-w-screen-xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Skeleton className="h-9 w-9 rounded-[5px]" />
          </Link>
          <Link
            href="/support"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <HelpCircle className="w-4 h-4 mr-1" />
            Support
          </Link>
        </div>
      </header>

      {/* Main Content - Two Column Layout */}
      <div className="flex flex-1">
        {/* Left Column - SignUp Form Skeleton */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center lg:text-left">
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-5 w-64 mt-2" />
            </div>

            <div className="space-y-4">
              {/* Email field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Confirm Password field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Submit button */}
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <Skeleton className="h-4 w-24 bg-background" />
              </div>
            </div>

            {/* Social buttons */}
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Terms and login link */}
            <div className="mt-6 text-center">
              <Skeleton className="h-4 w-64 mx-auto mb-2" />
              <Skeleton className="h-4 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-40 mx-auto mt-4" />
            </div>
          </div>
        </div>

        {/* Right Column - Visual Element */}
        <div className="hidden lg:flex w-1/2 bg-[#8B5CF6] items-center justify-center relative overflow-hidden">
          <Skeleton className="absolute inset-0 rounded-none" />
        </div>
      </div>
    </div>
  );
}
