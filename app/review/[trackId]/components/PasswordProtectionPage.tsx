// app/review/[trackId]/PasswordProtectionPage.tsx
"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RevButtons } from "@/components/ui/RevButtons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, EyeOff, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

interface PasswordProtectionPageProps {
  trackId: string;
  projectId: string;
  verifyPasswordAction: (
    projectId: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
}

export default function PasswordProtectionPage({
  projectId,
  verifyPasswordAction,
}: PasswordProtectionPageProps) {
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError("");

    try {
      const result = await verifyPasswordAction(projectId, password);
      if (result.success) {
        toast({
          title: "Success",
          description: "Password verified successfully",
          variant: "success",
        });
        // Refresh the page to reload with authorization
        router.refresh();
      } else {
        setError(result.message || "Incorrect password");
        toast({
          title: "Error",
          description: result.message || "Incorrect password",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      toast({
        title: "Error",
        description: err.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="container mx-auto py-12 flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md border-2 border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center bg-[#78350F]/40 text-yellow-500 hover:bg-[#78350F]/60  border-2 rounded-lg  mb-4">
            <Lock className="h-8 w-8 " />
          </div>
          <CardTitle className="text-2xl font-bold">
            Password Protected
          </CardTitle>
          <CardDescription>
            This content is password protected. Please enter the password to
            view.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pr-10 ${error ? "border-red-500" : ""}`}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm leading-5"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <RevButtons
              type="submit"
              className="w-full"
              disabled={isPending || !password.trim()}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Access Content"
              )}
            </RevButtons>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
