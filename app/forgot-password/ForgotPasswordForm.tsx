"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TextureButton } from "@/components/ui/texture-button";

const RESET_DELAY = 60000; // 60 seconds

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const storedTime = localStorage.getItem("lastPasswordResetRequestTime");
    if (storedTime) {
      const lastTime = parseInt(storedTime, 10);
      setLastRequestTime(lastTime);
      const remainingTime = Math.max(0, RESET_DELAY - (Date.now() - lastTime));
      setCountdown(Math.ceil(remainingTime / 1000));
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCount) => prevCount - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const now = Date.now();
    if (now - lastRequestTime < RESET_DELAY) {
      const remainingTime = Math.ceil(
        (RESET_DELAY - (now - lastRequestTime)) / 1000
      );
      setMessage({
        type: "error",
        text: `Please wait ${remainingTime} seconds before requesting another reset link.`,
      });
      setCountdown(remainingTime);
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setMessage({
        type: "success",
        text: "Great! We've sent a password reset link to your email. Please check your inbox and follow the instructions to reset your password.",
      });
      setLastRequestTime(now);
      localStorage.setItem("lastPasswordResetRequestTime", now.toString());
      setCountdown(60);
    } catch (error) {
      console.error("Error requesting password reset:", error);
      setMessage({
        type: "error",
        text: getErrorMessage(error),
      });
    }

    setIsLoading(false);
  };

  const getErrorMessage = (error: any): string => {
    if (error.message === "User not found") {
      return "We couldn't find an account with that email address. Please check the email and try again.";
    }
    return "We encountered an issue while sending the reset link. Please try again later or contact support if the problem persists.";
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4">
      <img
        src="/test-logo.png"
        alt=""
        width={70}
        className="rounded-[5px] mb-10"
      />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Forgot Your Password?
          </CardTitle>
          <CardDescription>
            No worries! Enter your email address below, and we'll send you
            instructions to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full rounded-full"
              />
              {countdown > 0 && (
                <p className="text-sm text-muted-foreground">
                  You can request another reset link in {countdown} seconds.
                </p>
              )}
            </div>
            <TextureButton
              type="submit"
              className="w-full rounded-full"
              variant={isLoading ? "blue" : "primary"}
              disabled={isLoading || countdown > 0}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isLoading ? "Sending Reset Link..." : "Send Password Reset Link"}
            </TextureButton>
          </form>
          {message && (
            <Alert
              className="mt-4"
              variant={message.type === "error" ? "destructive" : "default"}
            >
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="link" asChild className="mx-auto">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Login
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
