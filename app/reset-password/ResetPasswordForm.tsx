"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { resetPassword } from "./actions";
import Image from "next/image";

interface ResetPasswordFormProps {
  token_hash?: string;
}

export default function ResetPasswordForm({
  token_hash,
}: ResetPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    hasNumber: false,
    hasUpperCase: false,
  });

  const checkPasswordRequirements = (value: string) => {
    setPasswordRequirements({
      length: value.length >= 8,
      hasNumber: /\d/.test(value),
      hasUpperCase: /[A-Z]/.test(value),
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    const supabase = createClient();

    if (token_hash) {
      if (password !== confirmPassword) {
        setMessage("The passwords you entered don't match. Please try again.");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("password", password);
      formData.append("token_hash", token_hash);

      const result = await resetPassword(formData);

      if ("error" in result) {
        setMessage(result.error ?? "");
      } else {
        setMessage(
          "Great news! Your password has been successfully updated. You can now log in with your new password."
        );
        setTimeout(() => router.push("/login"), 3000);
      }
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setMessage(getErrorMessage(error.message));
      } else {
        setMessage(
          "We've sent a password reset link to your email. Please check your inbox and follow the instructions."
        );
      }
    }
    setIsLoading(false);
  };

  function getErrorMessage(error: string): string {
    switch (error) {
      case "Email not found":
        return "We couldn't find an account with that email address. Please check and try again.";
      case "For security purposes, you can only request this once every 60 seconds":
        return "Please wait a minute before requesting another password reset.";
      default:
        return "An unexpected error occurred. Please try again later or contact support if the problem persists.";
    }
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4">
      <Image
        src="/test-logo.png"
        alt="Logo"
        width={70}
        height={70}
        className="rounded-[5px] mb-10"
      />
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>
            {token_hash ? "Set New Password" : "Reset Password"}
          </CardTitle>
          <CardDescription>
            {token_hash
              ? "Choose a strong, unique password to secure your account"
              : "Enter your email address and we'll send you instructions to reset your password"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              {!token_hash ? (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        checkPasswordRequirements(e.target.value);
                      }}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => {
                        if (!password) setIsPasswordFocused(false);
                      }}
                      placeholder="Enter your new password"
                      required
                    />
                    {isPasswordFocused && (
                      <div className="text-sm space-y-1 mt-2">
                        <p
                          className={`flex items-center gap-2 ${
                            passwordRequirements.length
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          {passwordRequirements.length ? "✓" : "○"} At least 8
                          characters
                        </p>
                        <p
                          className={`flex items-center gap-2 ${
                            passwordRequirements.hasNumber
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          {passwordRequirements.hasNumber ? "✓" : "○"} At least
                          one number
                        </p>
                        <p
                          className={`flex items-center gap-2 ${
                            passwordRequirements.hasUpperCase
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          {passwordRequirements.hasUpperCase ? "✓" : "○"} At
                          least one uppercase letter
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      required
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              variant={token_hash ? "blue_plus" : "secondary"}
              className={"w-full "}
              disabled={isLoading}
            >
              {isLoading
                ? token_hash
                  ? "Updating Password..."
                  : "Sending Reset Instructions..."
                : token_hash
                  ? "Set New Password"
                  : "Send Reset Instructions"}
            </Button>
          </CardFooter>
        </form>
        {message && (
          <Alert
            className="mt-4"
            variant={
              message.includes("Great news!") ? "default" : "destructive"
            }
          >
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </Card>
    </div>
  );
}
