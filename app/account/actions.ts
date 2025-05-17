// @ts-nocheck
"use server";

import { createClient } from "@/utils/supabase/server";
import { timeZones } from "@/utils/timezones";
import { revalidatePath } from "next/cache";

const AVATAR_MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function uploadImageToImgBB(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  if (file.length > AVATAR_MAX_SIZE) {
    throw new Error(
      `File size exceeds ${AVATAR_MAX_SIZE / (1024 * 1024)}MB limit`
    );
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(contentType)) {
    throw new Error("Invalid file type. Only JPEG, PNG and WebP are supported");
  }

  const formData = new FormData();
  formData.append("image", new Blob([file], { type: contentType }));
  formData.append("name", fileName);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to upload image: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.data?.url) {
    throw new Error("Invalid ImgBB response");
  }

  return data.data.url;
}

// Constants moved to account-related naming
const ACCOUNT_AVATAR_MAX_SIZE = 32 * 1024 * 1024; // 32MB
const ACCOUNT_REQUIRED_FIELDS = [
  "full_name",
  "display_name",
  "account_type",
  "timezone", // Added timezone as required
];

export async function updateAccount(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  try {
    const { data: currentProfile, error: profileError } = await supabase
      .from("editor_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      throw new Error("Failed to fetch current profile");
    }

    let profileData: Record<string, any> = { ...currentProfile };

    // Handle avatar upload
    const avatarFile = formData.get("image") as File;
    if (avatarFile instanceof File) {
      if (avatarFile.size > ACCOUNT_AVATAR_MAX_SIZE) {
        throw new Error("Avatar file size exceeds limit");
      }
      const bytes = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const avatarUrl = await uploadImageToImgBB(
        buffer,
        `avatar_${user.id}`,
        avatarFile.type
      );
      profileData.avatar_url = avatarUrl;
    }

    // Process only the fields we need, ignore the rest
    const allowedFields = [
      "full_name",
      "display_name",
      "account_type",
      "timezone",
      "email", // Keep read-only email
    ];

    // Remove unused fields from profile data
    Object.keys(profileData).forEach((key) => {
      if (
        !allowedFields.includes(key) &&
        key !== "user_id" &&
        key !== "avatar_url" &&
        key !== "id" &&
        key !== "created_at" &&
        key !== "updated_at"
      ) {
        delete profileData[key];
      }
    });

    // Update with new form data
    for (const [key, value] of formData.entries()) {
      if (key === "image") continue; // Skip image as we handled it separately
      if (allowedFields.includes(key)) {
        profileData[key] = value;
      }
    }

    // Validate required fields
    for (const field of ACCOUNT_REQUIRED_FIELDS) {
      if (!profileData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    // Check display name if changed
    if (
      profileData.display_name.toLowerCase() !==
      currentProfile.display_name.toLowerCase()
    ) {
      const { data, error } = await supabase
        .from("editor_profiles")
        .select("display_name")
        .eq("display_name", profileData.display_name.toLowerCase())
        .limit(1);

      if (error) {
        throw new Error("Failed to validate display name");
      }
      if (data.length > 0) {
        throw new Error("This display name is already taken");
      }
    }

    // Force lowercase for display name
    profileData.display_name = profileData.display_name.toLowerCase();

    // Clean up undefined/null values
    Object.keys(profileData).forEach((key) => {
      if (profileData[key] === undefined || profileData[key] === null) {
        delete profileData[key];
      }
    });
    const timezoneValue = formData.get("timezone") as string;
    if (timezoneValue) {
      const isValidTimezone = timeZones.some((tz) => tz.zone === timezoneValue);
      if (!isValidTimezone) {
        throw new Error("Invalid timezone selected");
      }
      profileData.timezone = timezoneValue; // Store just the zone value
    }
    // Update profile
    const { error: updateError } = await supabase
      .from("editor_profiles")
      .upsert(profileData, { onConflict: "user_id" });

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    revalidatePath("/dashboard/account");
    return { message: "Account updated successfully" };
  } catch (error) {
    console.error("Account update error:", error);
    throw error instanceof Error ? error : new Error("Unexpected error");
  }
}

export async function checkDisplayNameAvailability(displayName: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("editor_profiles")
    .select("display_name")
    .ilike("display_name", displayName)
    .limit(1);

  if (error) {
    console.error("Error checking display name availability:", error);
    throw new Error("Failed to check display name availability");
  }

  return { available: data.length === 0 };
}
