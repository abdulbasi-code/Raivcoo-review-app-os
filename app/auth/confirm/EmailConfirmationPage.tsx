// @ts-nocheck
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import React from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Component that uses useSearchParams
function EmailConfirmationContent() {
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    title: string;
    text: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();

  // Import inside the component

  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const type = searchParams.get("type");
    const emailParam = searchParams.get("email");
    if (token && type === "signup" && emailParam) {
      setEmail(emailParam);
      confirmEmail(token, emailParam);
    } else {
      setMessage({
        type: "info",
        title: "Manual Confirmation Required",
        text: "Please enter your email and confirmation code to complete the signup process.",
      });
    }
  }, [searchParams]);

  const confirmEmail = async (token: string, email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        token,
        type: "signup",
        email,
      });
      if (error) {
        setMessage({
          type: "error",
          title: "Confirmation Failed",
          text: error.message,
        });
      } else {
        setMessage({
          type: "success",
          title: "Email Confirmed",
          text: "Your email has been confirmed successfully! You will be redirected to login shortly.",
        });
        setTimeout(() => router.push("/login"), 5000);
      }
    } catch (error) {
      setMessage({
        type: "error",
        title: "Unexpected Error",
        text: "An unexpected error occurred. Please try again.",
      });
    }
    setIsLoading(false);
  };

  const handleManualConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp && email) {
      confirmEmail(otp, email);
    } else {
      setMessage({
        type: "error",
        title: "Invalid Input",
        text: "Please provide both email and confirmation code.",
      });
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center space-y-4 p-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-center text-sm text-muted-foreground">
            Confirming your email...
          </p>
        </div>
      ) : message ? (
        <Alert
          variant={
            message.type === "error"
              ? "destructive"
              : message.type === "success"
                ? "default"
                : "default"
          }
          className="mb-4"
        >
          {message.type === "success" && <CheckCircle className="h-4 w-4" />}
          {message.type === "error" && <XCircle className="h-4 w-4" />}
          <AlertTitle>{message.title}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      ) : null}
      {!isLoading && message?.type !== "success" && (
        <form onSubmit={handleManualConfirm} className="space-y-4 w-full">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="space-y-2  flex flex-col w-full ">
            <Label htmlFor="otp">Confirmation Code</Label>
            <InputOTP
              className="flex-grow justify-center items-center w-full"
              value={otp}
              onChange={setOtp}
              maxLength={6}
              render={({ slots }) => (
                <InputOTPGroup>
                  {slots.map((slot, index) => (
                    <React.Fragment key={index}>
                      <InputOTPSlot {...slot} className="" />
                    </React.Fragment>
                  ))}
                </InputOTPGroup>
              )}
            />
          </div>
          <Button type="submit" className="w-full">
            Confirm Email
          </Button>
        </form>
      )}

      {message?.type === "success" && (
        <Button
          variant="link"
          onClick={() => router.push("/login")}
          className="text-primary"
        >
          Go to Login <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </>
  );
}

export default function EmailConfirmationPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center  p-4">
      <img
        src="/test-logo.png"
        alt=""
        width={70}
        className="rounded-[5px] mb-10"
      />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Email Confirmation
          </CardTitle>
          <CardDescription className="text-center">
            Confirm your email address to complete the signup process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            }
          >
            <EmailConfirmationContent />
          </Suspense>
        </CardContent>
        <CardFooter className="flex justify-center"></CardFooter>
      </Card>
    </div>
  );
}
