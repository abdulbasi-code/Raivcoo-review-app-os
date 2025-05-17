// app/set-password/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import SetPasswordForm from "./set-password-form";

export const metadata: Metadata = {
  title: "Set Password - Test",
  description: "Set or update your account password",
};

export default async function SetPasswordPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users to login
  if (error || !user) {
    redirect("/login?message=You+must+be+logged+in+to+set+a+password");
  }

  // Get the editor profile to check has_password flag
  const { data: editorProfile, error: profileError } = await supabase
    .from("editor_profiles")
    .select("has_password")
    .eq("user_id", user.id)
    .single();

  // Also check if user has password auth (as fallback)
  const hasPasswordAuth = user.identities?.some(
    (identity) =>
      identity.provider === "email" &&
      identity.identity_data?.email === user.email
  );

  // User has a password if either the profile flag is true or the auth provider indicates it
  const userHasPassword = editorProfile?.has_password || hasPasswordAuth;

  // Get user's email
  const userEmail = user.email || "";

  return (
    <SetPasswordForm
      initialHasPassword={!!userHasPassword}
      userEmail={userEmail}
      userId={user.id}
    />
  );
}