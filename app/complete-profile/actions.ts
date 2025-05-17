// app/complete-profile/actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

const MIN_DISPLAY_NAME_LENGTH = 3;
const MAX_DISPLAY_NAME_LENGTH = 20;

export async function completeInitialProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  try {
    // Get required fields from form
    const displayName = (formData.get("display_name") as string)?.toLowerCase();

    // Basic validation
    if (!displayName) {
      throw new Error("Display name are required");
    }

    if (
      displayName.length < MIN_DISPLAY_NAME_LENGTH ||
      displayName.length > MAX_DISPLAY_NAME_LENGTH
    ) {
      throw new Error(
        `Display name must be between ${MIN_DISPLAY_NAME_LENGTH} and ${MAX_DISPLAY_NAME_LENGTH} characters`
      );
    }

    // Check if display name is available
    const { data: existingNames, error: checkError } = await supabase
      .from("editor_profiles")
      .select("display_name")
      .eq("display_name", displayName)
      .neq("user_id", user.id) // Don't match the current user
      .limit(1);

    if (checkError) {
      console.error("Error checking display name:", checkError);
      throw new Error("Failed to validate display name");
    }

    if (existingNames && existingNames.length > 0) {
      throw new Error("This display name is already taken");
    }

    // Check if the user already has a profile
    const { data: existingProfile, error: profileError } = await supabase
      .from("editor_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116 is "not found"
      console.error("Error fetching profile:", profileError);
    }

    // Prepare profile data
    const profileData = {
      user_id: user.id,
      display_name: displayName,
      email: user.email,
    };

    // Try an insert first if no profile exists
    if (!existingProfile) {
      const { error: insertError } = await supabase
        .from("editor_profiles")
        .insert(profileData);

      if (insertError) {
        console.error("Insert error:", insertError);
        // If insert fails due to unique constraint, try upsert
        if (insertError.code === "23505") {
          // PostgreSQL unique violation
          console.log(
            "Trying upsert instead due to unique constraint violation"
          );
        } else {
          throw new Error(`Failed to create profile: ${insertError.message}`);
        }
      } else {
        revalidatePath("/dashboard");
        return { message: "Profile completed successfully" };
      }
    }

    // Update profile (or fall back to this if insert failed)
    const { error: updateError } = await supabase
      .from("editor_profiles")
      .upsert(profileData, {
        onConflict: "user_id",
        ignoreDuplicates: false,
      });

    if (updateError) {
      console.error("Upsert error:", updateError);
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    revalidatePath("/dashboard");
    return { message: "Profile completed successfully" };
  } catch (error) {
    console.error("Profile completion error:", error);
    throw error instanceof Error ? error : new Error("Unexpected error");
  }
}

export async function validateDisplayName(
  displayName: string,
  currentDisplayName: string = ""
) {
  if (!displayName) {
    return {
      isValid: false,
      errors: ["Display name is required"],
    };
  }

  if (displayName.length < MIN_DISPLAY_NAME_LENGTH) {
    return {
      isValid: false,
      errors: [
        `Display name must be at least ${MIN_DISPLAY_NAME_LENGTH} characters`,
      ],
    };
  }

  if (displayName.length > MAX_DISPLAY_NAME_LENGTH) {
    return {
      isValid: false,
      errors: [
        `Display name must be less than ${MAX_DISPLAY_NAME_LENGTH} characters`,
      ],
    };
  }

  // If display name didn't change, it's valid
  if (displayName === currentDisplayName) {
    return { isValid: true, errors: [] };
  }

  // Special characters validation
  if (!/^[a-z0-9_.-]+$/.test(displayName)) {
    return {
      isValid: false,
      errors: [
        "Only lowercase letters, numbers, underscores, dots, and hyphens are allowed",
      ],
    };
  }

  // Check availability in database
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("editor_profiles")
      .select("display_name")
      .eq("display_name", displayName)
      .limit(1);

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      return {
        isValid: false,
        errors: ["This display name is already taken"],
      };
    }

    return { isValid: true, errors: [] };
  } catch (error) {
    console.error("Error validating display name:", error);
    return {
      isValid: false,
      errors: ["Failed to validate display name"],
    };
  }
}
