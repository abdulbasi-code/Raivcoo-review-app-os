"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function forgotPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Password reset email sent. Check your inbox." };
}

export async function resetPassword(formData: FormData) {
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    return { success: "Password updated successfully." };
  } else {
    return { error: "Failed to update password. Please try again." };
  }
}
