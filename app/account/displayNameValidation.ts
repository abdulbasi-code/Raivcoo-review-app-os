// utils/displayNameValidation.ts
"use server";
import { createClient } from "@/utils/supabase/server";
import { profanityList } from "../../utils/ProfileOptions";

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

const reservedWords = [
  "admin",
  "official",
  "support",
  "help",
  "mod",
  "moderator",
  "editor",
  "developers",
  "edit",
];

export async function validateDisplayName(
  displayName: string,
  currentDisplayName: string = ""
): Promise<ValidationResult> {
  const result: ValidationResult = { isValid: true, errors: [] };

  // Length check
  if (displayName.length < 3 || displayName.length > 20) {
    result.errors.push("Display name must be between 3 and 20 characters.");
  }

  // Allowed characters
  if (!/^[a-zA-Z0-9_]+$/.test(displayName)) {
    result.errors.push(
      "Display name can only contain letters, numbers, and underscores."
    );
  }

  // No consecutive underscores
  if (displayName.includes("__")) {
    result.errors.push("Display name cannot contain consecutive underscores.");
  }

  // Can't start or end with underscore
  if (displayName.startsWith("_") || displayName.endsWith("_")) {
    result.errors.push("Display name cannot start or end with an underscore.");
  }

  // Not all numbers
  if (/^\d+$/.test(displayName)) {
    result.errors.push("Display name cannot be all numbers.");
  }

  // Reserved words check
  if (reservedWords.includes(displayName.toLowerCase())) {
    result.errors.push("This display name is reserved and cannot be used.");
  }

  // Profanity check
  if (profanityList.some((word) => displayName.toLowerCase().includes(word))) {
    result.errors.push("Display name contains inappropriate language.");
  }

  // Availability check (only if the name has changed)
  if (displayName.toLowerCase() !== currentDisplayName.toLowerCase()) {
    const isAvailable = await checkDisplayNameAvailability(displayName);
    if (!isAvailable) {
      result.errors.push("This display name is already taken.");
    }
  }

  result.isValid = result.errors.length === 0;
  return result;
}

async function checkDisplayNameAvailability(
  displayName: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("editor_profiles")
    .select("display_name")
    .ilike("display_name", displayName)
    .limit(1);

  if (error) {
    console.error("Error checking display name availability:", error);
    return false;
  }

  return data.length === 0;
}
