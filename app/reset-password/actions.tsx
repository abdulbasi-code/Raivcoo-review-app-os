"use server";

import { createServerSupabaseClient } from "./supabase-server";


const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

export async function resetPassword(formData: FormData) {
  const password = formData.get("password") as string;
  const token_hash = formData.get("token_hash") as string;

  if (!password) {
    return { error: "Password is required" };
  }

  if (!PASSWORD_REGEX.test(password)) {
    return {
      error:
        "Password must be at least 8 characters long with at least one uppercase letter and one number",
    };
  }

  const supabase = createServerSupabaseClient();

  // Verify the recovery token
  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash,
    type: "recovery",
  });

  if (verifyError) {
    return {
      error:
        "Invalid or expired reset token. Please try the password reset process again.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  return { success: "Your password has been successfully reset." };
}
