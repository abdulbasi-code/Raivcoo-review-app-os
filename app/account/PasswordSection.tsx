// app/profile/PasswordSection.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevButtons } from "@/components/ui/RevButtons";
import { ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PasswordSectionProps {
  hasPassword: boolean;
  email: string;
}

export default function PasswordSection({
  hasPassword,
  email,
}: PasswordSectionProps) {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
          Password Security
        </CardTitle>
      </CardHeader>

      <CardContent>
        {hasPassword ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-medium">
                Password is set for this account
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                You can sign in with your email and password
              </p>
            </div>
            <RevButtons asChild variant="outline" size="sm">
              <Link href="/set-password">
                Change Password
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </RevButtons>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-medium">
                No password set for this account
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                You're using social login ({email})
              </p>
            </div>
            <RevButtons asChild size="sm">
              <Link href="/set-password">
                Set Password
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </RevButtons>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
