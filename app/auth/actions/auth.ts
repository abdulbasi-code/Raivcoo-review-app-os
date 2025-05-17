"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// Password must have at least 8 characters, one uppercase letter, and one number
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const provider = formData.get("provider") as "discord" | "google" | undefined;
  const supabase = createClient();

  if (provider) {
    const { data, error } = await (await supabase).auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${process.env.DOMAIN_URL}/auth/callback`,
      },
    });

    if (error) {
      return { error: error.message };
    }

    return redirect(data.url);
  } else {
    // Password validation
    if (!PASSWORD_REGEX.test(password)) {
      return {
        error:
          "Password must be at least 8 characters long and include one uppercase letter and one number",
      };
    }

    const { data, error } = await (
      await supabase
    ).auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.DOMAIN_URL}/auth/callback`,
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (
      data.user &&
      data.user.identities &&
      data.user.identities.length === 0
    ) {
      return { error: "User already exists" };
    }

    return { success: "Check your email to confirm your sign-up!" };
  }
}
