// app/dashboard/extensions/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import ExtensionsClient from "./extensions-client";

export const metadata: Metadata = {
  title: "Extensions - TEST",
  description: "Download and use TEST extensions for Adobe products",
};

export default async function ExtensionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }
  const { data: existingPortfolio, error: fetchError } = await supabase
    .from("editor_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Error fetching portfolio:", fetchError);
    throw fetchError;
  }

  // Check if user has password auth
  const hasPasswordAuthFromIdentities = user.identities?.some(
    (identity) =>
      identity.provider === "email" &&
      identity.identity_data?.email === user.email
  );

  // User has a password if either source indicates it
  const hasPasswordAuth =
    existingPortfolio?.has_password || hasPasswordAuthFromIdentities;

  // Get user profile data
  const { data: profile } = await supabase
    .from("editor_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <ExtensionsClient
      hasPasswordAuth={!!hasPasswordAuth}
      email={user.email || ""}
      profile={profile}
    />
  );
}
