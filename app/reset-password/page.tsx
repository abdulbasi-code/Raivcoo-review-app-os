"use client";

import { Suspense } from "react";
import { DotPatternBg } from "../components/backgrounds/backgrounds";
import ResetPasswordForm from "./ResetPasswordForm";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token_hash = searchParams.get("token_hash");

  return <ResetPasswordForm token_hash={token_hash ?? undefined} />;
}

function LoadingFallback() {
  return (
    <div className="flex justify-center items-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

export default function ResetPassword() {
  return (
    <>
      <DotPatternBg>
        <Suspense fallback={<LoadingFallback />}>
          <ResetPasswordContent />
        </Suspense>
      </DotPatternBg>
    </>
  );
}
