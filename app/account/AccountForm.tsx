//ProfileForm.tsx file

"use client";
import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RevButtons } from "@/components/ui/RevButtons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CameraIcon, Loader2, CheckCircle2 } from "lucide-react";
import { validateDisplayName } from "./displayNameValidation";
import Image from "next/image";

import { timeZones } from "@/utils/timezones";

export interface AccountData {
  email: string;
  user_id: string;
  full_name: string;
  display_name: string;
  avatar_url: string;
  timezone?: string;
}

interface AccountFormProps {
  Account: AccountData;
  updateAccount: (formData: FormData) => Promise<{ message: string }>;
}

const MIN_FULL_NAME_LENGTH = 5;
const MAX_FULL_NAME_LENGTH = 30;
const MIN_DISPLAY_NAME_LENGTH = 3;
const MAX_DISPLAY_NAME_LENGTH = 20;

export default function AccountForm({
  Account,
  updateAccount,
}: AccountFormProps) {
  const [displayNameErrors, setDisplayNameErrors] = useState<string[]>([]);
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState(Account.full_name);
  const [displayName, setDisplayName] = useState(Account.display_name);
  const [timezone, setTimezone] = useState(Account.timezone || "UTC");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDisplayNameValid, setIsDisplayNameValid] = useState(true);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (previewAvatarUrl) {
        URL.revokeObjectURL(previewAvatarUrl);
      }
    };
  }, [previewAvatarUrl]);

  // Validation flags
  const isFullNameValid =
    fullName.length >= MIN_FULL_NAME_LENGTH &&
    fullName.length <= MAX_FULL_NAME_LENGTH;
  const isFormValid = isFullNameValid && isDisplayNameValid;

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value);
  };

  const handleDisplayNameBlur = async () => {
    if (displayName !== Account.display_name) {
      startTransition(async () => {
        const validationResult = await validateDisplayName(
          displayName,
          Account.display_name
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

    if (!isFormValid) {
      toast({
        title: "Validation Error",
        description: "Please check all fields and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      // Handle avatar upload
      if (newAvatarFile) {
        formData.set("image", newAvatarFile);
      }

      // Add form data
      formData.set("full_name", fullName);
      formData.set("display_name", displayName.toLowerCase());
      formData.set("timezone", timezone);

      // Submit form
      const result = await updateAccount(formData);

      toast({
        title: "Success",
        description: result.message,
        variant: "success",
      });

      // Clean up preview URL
      if (previewAvatarUrl) {
        URL.revokeObjectURL(previewAvatarUrl);
        setPreviewAvatarUrl(null);
      }

      setNewAvatarFile(null);
      router.refresh();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: `Failed to update profile: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 32 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size should be less than 32MB",
          variant: "destructive",
        });
        return;
      }
      setNewAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPreviewAvatarUrl(previewUrl);
    }
  };

  // Simplified character count display
  const renderCharacterCount = (current: number, min: number, max: number) => {
    const isValid = current >= min && current <= max;
    return (
      <p
        className={`text-sm ${isValid ? "text-green-500" : "text-red-500"} mt-1`}
      >
        {current}/{max}
      </p>
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-0 p-0 m-0 bg-transparent">
        <CardContent className=" p-0 m-0 space-y-6 mt-4">
          {/* Avatar and User Info - Side by side layout */}
          <div className="grid grid-cols-1   w-full">
            {/* Left side - Avatar */}
            {/* Avatar and User Info - Better balanced layout */}
            <div className="flex flex-col sm:flex-row w-full items-center gap-6 pb-4 border-b">
              {/* Left side - Avatar and name */}
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div
                    className="group relative cursor-pointer"
                    onClick={() =>
                      document.getElementById("avatar-upload")?.click()
                    }
                    role="button"
                    aria-label="Change profile picture"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        document.getElementById("avatar-upload")?.click();
                      }
                    }}
                  >
                    <Avatar className="h-20 w-20 rounded-xl border-2 border-primary/10 shadow-sm">
                      <AvatarImage
                        src={previewAvatarUrl || Account.avatar_url}
                        loading="lazy"
                        alt={Account.display_name}
                      />
                      <AvatarFallback className="bg-muted rounded-none">
                        <Image
                          src={"/avif/user-profile-avatar.avif"}
                          alt={Account.display_name || "User Avatar"}
                          fill
                          loading="lazy"
                        />
                      </AvatarFallback>
                    </Avatar>

                    {/* Improved hover state */}
                    <div className="absolute inset-0 rounded-xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white dark:bg-gray-800 rounded-[10px] p-2">
                        <CameraIcon className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </div>

                  {/* Visual indicator when new avatar is selected */}
                  {newAvatarFile && (
                    <div className="absolute -bottom-1 -right-1 bg-green-900 text-green-500 rounded-[5px] p-1">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  )}

                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    aria-label="Upload profile picture"
                  />
                </div>

                {/* Name info */}
                <div className="flex flex-col">
                  <h2 className="text-xl font-semibold">{Account.full_name}</h2>
                  <p className="text-sm text-muted-foreground">
                    @{Account.display_name}
                  </p>
                </div>
              </div>

              {/* Right side - Account type badge */}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                type="text"
                name="full_name"
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`mt-1 ${!isFullNameValid && fullName.length > 0 ? "border-red-500" : ""}`}
                required
                placeholder="Enter your full name"
              />
              {renderCharacterCount(
                fullName.length,
                MIN_FULL_NAME_LENGTH,
                MAX_FULL_NAME_LENGTH
              )}
            </div>

            {/* Display Name */}
            <div>
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                type="text"
                name="display_name"
                id="display_name"
                value={displayName}
                onChange={(e) => {
                  const lowercaseValue = e.target.value.toLowerCase();
                  handleDisplayNameChange({
                    ...e,
                    target: { ...e.target, value: lowercaseValue },
                  });
                }}
                onBlur={handleDisplayNameBlur}
                className={`mt-1 ${!isDisplayNameValid ? "border-red-500" : ""}`}
                placeholder="Choose your display name"
                required
                autoCapitalize="none"
                style={{ textTransform: "lowercase" }}
              />
              {renderCharacterCount(
                displayName.length,
                MIN_DISPLAY_NAME_LENGTH,
                MAX_DISPLAY_NAME_LENGTH
              )}

              {isPending && (
                <p className="text-sm text-gray-500">
                  Checking availability...
                </p>
              )}

              {displayNameErrors.length > 0 && !isPending && (
                <ul className="text-sm text-red-500 mt-1">
                  {displayNameErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Email - Non-editable */}
            <div>
              <Label htmlFor="Email">Email</Label>
              <Input
                type="text"
                name="Email"
                disabled={true}
                id="Email"
                value={Account.email}
                className="cursor-not-allowed mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Contact support to update your email address
              </p>
            </div>

            {/* Time Zone */}
            <div>
              <Label htmlFor="timezone">Time Zone</Label>
              <Select
                name="timezone"
                value={timezone}
                onValueChange={(value) => setTimezone(value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select time zone" />
                </SelectTrigger>
                <SelectContent>
                  {/* Group timezones by region */}
                  {Array.from(new Set(timeZones.map((tz) => tz.region))).map(
                    (region) => (
                      <SelectGroup key={region}>
                        <SelectLabel className="text-sm text-muted-foreground">
                          {region}
                        </SelectLabel>
                        {timeZones
                          .filter((tz) => tz.region === region)
                          .map((tz) => (
                            <SelectItem key={tz.zone} value={tz.zone}>
                              {tz.label}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    )
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Your time zone helps with project deadlines and notifications
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="">
            <RevButtons
              type="submit"
              disabled={isLoading || !isFormValid || isPending}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </RevButtons>
          </div>
          {/* Support info */}
          <p className="text-xs text-center text-muted-foreground">
            Need help? Contact us at{" "}
            <a
              href="mailto:ravivcoo@gmail.com"
              className="hover:underline transition-all"
            >
              Ravivcoo@gmail.com
            </a>{" "}
            or{" "}
            <a
              href="https://twitter.com/TEST"
              className="hover:underline transition-all"
            >
              Twitter
            </a>
          </p>
        </CardContent>
      </Card>
    </form>
  );
}
