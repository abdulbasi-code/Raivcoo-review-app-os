// app/set-password/set-password-form.tsx
// @ts-nocheck
"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { setPassword, sendPasswordEmail } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RevButtons } from "@/components/ui/RevButtons";
import { Loader2, HelpCircle, Home, ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { AuroraText } from "@/components/ui/aurora-text";

interface SetPasswordFormProps {
  initialHasPassword: boolean;
  userEmail: string;
  userId: string;
}

export default function SetPasswordForm({ initialHasPassword }: SetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingPassword] = useState(initialHasPassword);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await setPassword(formData);

    if (result?.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
      setIsLoading(false);
    } else if (result?.success) {
      try {
        await sendPasswordEmail({
          type: result.isNewPassword ? "created" : "updated",
          email: result.email,
          userId: result.userId,
        });
      } catch (e) {
        console.error("Failed to send notification email:", e);
      }

      toast({
        title: "Success",
        description: hasExistingPassword
          ? "Your password has been updated successfully."
          : "Your password has been set successfully.",
        variant: "success",
      });

      setIsLoading(false);
      setIsSuccess(true);
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b p-4">
          <div className="container max-w-screen-xl mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/test.svg"
                alt="test Logo"
                width={36}
                height={36}
                className="rounded-[5px]"
                priority
                quality={100}
              />
            </Link>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center">
          <div className="max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-[#064E3B]/40 border  hover:bg-[#064E3B]/60 rounded-[10px] flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-green-500" />
            </div>

            <h2 className="text-2xl font-bold mb-4">
              Password{" "}
              <AuroraText>
                {hasExistingPassword ? "Updated" : "Set"}{" "}
              </AuroraText>
            </h2>

            <p className="text-muted-foreground mb-8">
              {hasExistingPassword
                ? "Your password has been successfully updated."
                : "Your password has been successfully set for your account."}
              {" We've sent you a confirmation email with details."}
            </p>

            <div className="space-y-4">
              <RevButtons asChild className="w-full">
                <Link href="/dashboard">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Link>
              </RevButtons>

              <RevButtons asChild variant="outline" className="w-full">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Return to Home
                </Link>
              </RevButtons>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-4 py-2">
        <div className="container max-w-screen-2xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/MainLogo.png"
              alt="test Logo"
              width={50}
              height={50}
              className="rounded-[5px]"
              priority
              quality={100}
            />
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

      <div className="flex flex-1">
        <div className="w-full  flex items-center justify-center p-8">
          <Card className="w-full p-4 max-w-md">
            <div className="mb-8 text-left">
              <h1
                className="text-3xl font-bold tracking-tight text-transparent bg-clip-text 
                dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]
                bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.00)_202.08%)]"
              >
                {hasExistingPassword
                  ? "Change Your Password"
                  : "Set Your Password"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {hasExistingPassword
                  ? "Update the password for your account"
                  : "Create a password for your account"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {hasExistingPassword && (
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                    placeholder="••••••••••••••••"
                    className="w-full"
                    autoComplete="current-password"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="newPassword">
                  {hasExistingPassword ? "New Password" : "Password"}
                </Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  placeholder="••••••••••••••••"
                  className="w-full"
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••••••••••"
                  className="w-full"
                  autoComplete="new-password"
                />
              </div>

              <RevButtons className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {hasExistingPassword
                      ? "Updating Password..."
                      : "Setting Password..."}
                  </>
                ) : hasExistingPassword ? (
                  "Update Password"
                ) : (
                  "Set Password"
                )}
              </RevButtons>
            </form>
            {hasExistingPassword && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                Forget your password?{" "}
                <Link
                  href="/reset-password"
                  className="font-medium text-purple-600 hover:underline dark:text-purple-500"
                >
                  Reset Password
                </Link>
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
