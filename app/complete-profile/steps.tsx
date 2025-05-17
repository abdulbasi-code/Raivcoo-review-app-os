"use client";
import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { validateDisplayName } from "../account/displayNameValidation";
import { AuroraText } from "@/components/ui/aurora-text";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RevButtons } from "@/components/ui/RevButtons";

interface ProfileData {
  email: string | number | readonly string[] | undefined;
  user_id: string;
  display_name: string | null;
  account_type: "editor" | "client" | null;
}

interface ProfileFormProps {
  profile: ProfileData;
  updateProfile: (formData: FormData) => Promise<{ message: string }>;
}

const MIN_DISPLAY_NAME_LENGTH = 3;
const MAX_DISPLAY_NAME_LENGTH = 20;

export default function StepByStepProfileForm({
  profile,
  updateProfile,
}: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [accountType, setAccountType] = useState<"editor" | "client">(
    profile?.account_type || "editor"
  );
  const [isDisplayNameTouched, setIsDisplayNameTouched] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDisplayNameValid, setIsDisplayNameValid] = useState(true);
  const [displayNameErrors, setDisplayNameErrors] = useState<string[]>([]);

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value.toLowerCase());
  };

  const handleDisplayNameBlur = async () => {
    setIsDisplayNameTouched(true);
    if (displayName !== profile?.display_name) {
      startTransition(async () => {
        const validationResult = await validateDisplayName(
          displayName,
          profile?.display_name || ""
        );
        setIsDisplayNameValid(validationResult.isValid);
        setDisplayNameErrors(validationResult.errors);
      });
    } else {
      setIsDisplayNameValid(true);
      setDisplayNameErrors([]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isDisplayNameValid || displayName.length < MIN_DISPLAY_NAME_LENGTH) {
      toast({
        title: "Validation Error",
        description: "Please check your display name and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    formData.set("display_name", displayName.toLowerCase());
    formData.set("account_type", accountType);

    try {
      const result = await updateProfile(formData);

      toast({
        title: "Profile Updated",
        description: result.message,
        variant: "success",
      });
      router.push("/dashboard"); // Redirect after successful completion
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update profile: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderCharacterCount = (
    current: number,
    min: number,
    max: number,
    isTouched: boolean
  ) => {
    const isValid = current >= min && current <= max;
    const showError = isTouched && !isValid;
    const color = showError ? "text-red-500" : "text-muted-foreground";
    return (
      <p className={`text-sm ${color} mt-1 flex items-center`}>
        {showError ? (
          <AlertCircle className="w-4 h-4 mr-1" />
        ) : (
          <CheckCircle2 className="w-4 h-4 mr-1" />
        )}
        {current}/{max} characters
      </p>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 w-full">
      <div className="mb-6 text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Let’s Set Up Your <AuroraText>Account</AuroraText>
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          This helps us tailor your experience. Don’t worry—it only takes a
          minute.
        </p>
      </div>

      <div className="border rounded-lg p-6 bg-background space-y-6">
        {/* Display Name Input */}
        <div>
          <Label htmlFor="display_name">Display Name</Label>
          <div className="space-y-2 mt-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    type="text"
                    name="display_name"
                    id="display_name"
                    value={displayName}
                    onChange={handleDisplayNameChange}
                    onBlur={handleDisplayNameBlur}
                    className={!isDisplayNameValid ? "border-red-500" : ""}
                    placeholder="Choose your display name"
                    required
                    autoCapitalize="none"
                    style={{ textTransform: "lowercase" }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your display name will be used in your profile URL.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {isPending && (
              <p className="text-sm text-muted-foreground flex items-center">
                <span className="animate-spin mr-2">⏳</span>
                Checking availability...
              </p>
            )}

            {displayNameErrors.length > 0 && !isPending && (
              <ul className="text-sm text-red-500 space-y-1">
                {displayNameErrors.map((error, index) => (
                  <li key={index} className="flex items-center">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    {error}
                  </li>
                ))}
              </ul>
            )}

            {renderCharacterCount(
              displayName.length,
              MIN_DISPLAY_NAME_LENGTH,
              MAX_DISPLAY_NAME_LENGTH,
              isDisplayNameTouched
            )}
          </div>
        </div>


        {/* Submit Button */}
        <RevButtons
          variant={"default"}
          type="submit"
          className="w-full"
          disabled={isLoading || isPending || !isDisplayNameValid}
          size="lg"
        >
          {isLoading ? "Saving..." : "Complete Account"}
        </RevButtons>
      </div>
    </form>
  );
}
