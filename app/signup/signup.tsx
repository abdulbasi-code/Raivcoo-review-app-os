// SignUpForm.tsx

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, HelpCircle } from "lucide-react";
import { signUp } from "../auth/actions/auth";
import { RevButtons } from "@/components/ui/RevButtons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import BG from "../../public/LLL.png";
export default function SignUpForm() {
  const [isFormSubmitting, startFormTransition] = useTransition();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startFormTransition(async () => {
      const result = await signUp(formData);
      if (result.error) {
        toast({
          title: "Oops! Something went wrong",
          description: getErrorMessage(result.error),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome aboard!",
          description:
            "You've successfully signed up! Please check your email to confirm your sign-up",
          variant: "success",
        });
        router.push("/login");
      }
    });
  }

  async function handleSocialSignUp(provider: "discord" | "google") {
    setLoadingProvider(provider);
    try {
      const formData = new FormData();
      formData.append("provider", provider);
      // This will automatically redirect if successful
      await signUp(formData);
      // The code below will only run if there was NO redirect
      setLoadingProvider(null);
    } catch (error) {
      toast({
        title: "Social Sign Up Failed",
        description:
          "There was a problem with the social sign-up. Please try again.",
        variant: "destructive",
      });
      setLoadingProvider(null);
    }
  }

  function getErrorMessage(error: string): string {
    switch (error) {
      case "EmailExists":
        return "This email is already registered. Please try logging in or use a different email.";
      case "PasswordMismatch":
        return "The passwords you entered don't match. Please try again.";
      case "WeakPassword":
        return "Your password is too weak. Please choose a stronger password with at least 8 characters, including uppercase, lowercase, numbers, and symbols.";
      case "InvalidEmail":
        return "The email address you provided is not valid. Please check and try again.";
      case "SocialAuthError":
        return "There was a problem with the social sign-up. Please try again or use a different method.";
      default:
        return "An unexpected error occurred. Please try again later or contact support if the problem persists.";
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Minimal Header */}
      <header className="border-b px-4 py-2">
        <div className="container max-w-screen-2xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/MainLogo.png"
              alt="Test Logo"
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
        {/* Left Column - Signup Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center lg:text-left">
              <h1
                className="text-3xl font-bold  mb-1 text-transparent bg-clip-text 
      dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]
      bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]"
              >
                Create an Account
              </h1>
              <p className="text-muted-foreground mt-2">
                Start building your portfolio and let your video editing work
                speak for itself.
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
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  autoComplete="new-password"
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={(e) => {
                    if (!e.target.value) setIsPasswordFocused(false);
                  }}
                  onChange={(e) => checkPasswordRequirements(e.target.value)}
                />
                {isPasswordFocused && (
                  <div className="text-sm space-y-1 mt-2">
                    <p
                      className={`flex items-center gap-2 ${
                        passwordRequirements.length
                          ? "text-green-600 dark:text-green-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {passwordRequirements.length ? "✓" : "○"} At least 8
                      characters
                    </p>
                    <p
                      className={`flex items-center gap-2 ${
                        passwordRequirements.hasNumber
                          ? "text-green-600 dark:text-green-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {passwordRequirements.hasNumber ? "✓" : "○"} At least one
                      number
                    </p>
                    <p
                      className={`flex items-center gap-2 ${
                        passwordRequirements.hasUpperCase
                          ? "text-green-600 dark:text-green-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {passwordRequirements.hasUpperCase ? "✓" : "○"} At least
                      one uppercase letter
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>

              <RevButtons
                className="w-full"
                type="submit"
                variant={isFormSubmitting ? "outline" : "default"}
                disabled={isFormSubmitting || loadingProvider !== null}
              >
                {isFormSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Create Account"
                )}
              </RevButtons>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or sign up with
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <RevButtons
                className="w-full"
                onClick={() => handleSocialSignUp("google")}
                variant="outline"
                disabled={isFormSubmitting || loadingProvider !== null}
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
                Sign up with Google
              </RevButtons>

              <RevButtons
                className="w-full"
                onClick={() => handleSocialSignUp("discord")}
                variant="outline"
                disabled={isFormSubmitting || loadingProvider !== null}
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
                Sign up with Discord
              </RevButtons>
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                By signing up, you agree to our{" "}
                <Link
                  href="/legal/TermsOfService"
                  className="font-medium text-purple-600 hover:underline dark:text-purple-500"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/legal/PrivacyPolicy"
                  className="font-medium text-purple-600 hover:underline dark:text-purple-500"
                >
                  Privacy Policy
                </Link>
              </p>
              <p className="mt-4">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-purple-600 hover:underline dark:text-purple-500"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Visual Element */}

        <div className="hidden  lg:flex w-1/2 bg-[#8B5CF6] items-center justify-center relative overflow-hidden">
          <Image
            src={BG}
            placeholder="blur"
            alt="Background Illustration"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}