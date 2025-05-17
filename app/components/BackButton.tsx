// components/BackButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="mb-4"
      onClick={() => router.back()}
    >
      <ArrowLeft className="h-4 w-4 mr-2" /> Back
    </Button>
  );
}
