"use server";
// login/actions.ts
import { createClient } from "@/utils/supabase/server";

import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const provider = formData.get("provider") as "discord" | "google" | undefined;
  const supabase = await createClient();

  if (provider) {
    const { data, error } = await supabase.auth.signInWithOAuth({
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }
  }
  redirect("/");
}
