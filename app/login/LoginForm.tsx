"use client";
// LoginForm.tsx
import { useTransition } from "react";
import Link from "next/link";
import { Loader2, HelpCircle } from "lucide-react";
import { login } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";
import Image from "next/image";
import { RevButtons } from "@/components/ui/RevButtons";
import BG from "../../public/LLL.png";
export default function LoginForm() {
  // Separate loading states for each method
  const [isEmailLoading, startEmailTransition] = useTransition();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startEmailTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        toast({
          title: "Oops! Something went wrong",
          description: getErrorMessage(result.error),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in to your account.",
          variant: "success",
        });
      }
    });
  }

  async function handleSocialAuth(provider: "discord" | "google") {
    setLoadingProvider(provider);
    try {
      const formData = new FormData();
      formData.append("provider", provider);
      const result = await login(formData);

      if (result?.error) {
        toast({
          title: "Social Login Failed",
          description: getErrorMessage(result.error),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An unexpected error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setLoadingProvider(null);
    }
  }

  function getErrorMessage(error: string): string {
    switch (error) {
      case "CredentialsSignin":
        return "The email or password you entered is incorrect. Please try again.";
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
      case "EmailCreateAccount":
      case "Callback":
        return "There was a problem with the social login. Please try again or use a different method.";
      case "EmailSignin":
        return "There was a problem signing in with your email. Please check your email and password and try again.";
      case "SessionRequired":
        return "Please sign in to access this page.";
      default:
        return "An unexpected error occurred. Please try again later.";
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
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

      {/* Main Content - Two Column Layout */}
      <div className="flex flex-1">
        {/* Left Column - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="mb-8  text-left">
              <h1 className="flex items-center space-x-2">
                <span
                  className="text-3xl font-bold gap-2 truncate tracking-tight text-transparent bg-clip-text 
                dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]
                bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.00)_202.08%)]"
                >
                  Welcome Back{" "}
                </span>{" "}
                <Image
                  src="/waving-hand_1f44b.png"
                  alt="waving-hand"
                  width={36}
                  height={36}
                  priority
                  quality={100}
                ></Image>
              </h1>

              <p className="text-muted-foreground mt-2">
                Please sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••••••••••"
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-between">
                <Link
                  href="/forgot-password"
                  className="text-sm text-purple-600 hover:underline dark:text-purple-500"
                >
                  Forgot password?
                </Link>
              </div>

              <RevButtons
                className="w-full"
                type="submit"
                variant={isEmailLoading ? "outline" : "default"}
                disabled={isEmailLoading || loadingProvider !== null}
              >
                {isEmailLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Sign In"
                )}
              </RevButtons>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <RevButtons
                className="w-full"
                onClick={() => handleSocialAuth("google")}
                variant="outline"
                disabled={isEmailLoading || loadingProvider !== null}
              >
                {loadingProvider === "google" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fab"
                    data-icon="google"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 488 512"
                  >
                    <path
                      fill="currentColor"
                      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                    ></path>
                  </svg>
                )}
                Continue with Google
              </RevButtons>

              <RevButtons
                className="w-full"
                onClick={() => handleSocialAuth("discord")}
                variant="outline"
                disabled={isEmailLoading || loadingProvider !== null}
              >
                {loadingProvider === "discord" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914a.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                )}
                Continue with Discord
              </RevButtons>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-purple-600 hover:underline dark:text-purple-500"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="hidden lg:flex w-1/2 bg-[#8B5CF6] items-center justify-center relative overflow-hidden">
          <Image
            src={BG}
            placeholder="blur"
            alt="Background Illustration"
            fill
            className="object-cover"
            priority
            quality={100}
          />
        </div>
      </div>
    </div>
  );
}