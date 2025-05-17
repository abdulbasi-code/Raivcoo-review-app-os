// app/set-password/actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { Resend } from "resend";
import PasswordSetEmail from "./emails/password-set";
import PasswordUpdatedEmail from "./emails/password-updated";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function setPassword(formData: FormData) {
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validate new passwords match
  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match" };
  }

  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters long" };
  }

  try {
    const supabase = await createClient();

    // Securely get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "You must be logged in to change your password" };
    }

    // Check if user has password auth
    const hasPasswordAuth = user.identities?.some(
      (identity) =>
        identity.provider === "email" &&
        identity.identity_data?.email === user.email
    );

    // Get the user's current editor profile
    const { data: editorProfile, error: profileError } = await supabase
      .from("editor_profiles")
      .select("has_password")
      .eq("user_id", user.id)
      .single();

    // Determine if the user actually has a password set
    const userHasPassword = editorProfile?.has_password || hasPasswordAuth;

    if (userHasPassword && currentPassword) {
      // If user has a password, verify the current one first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || "",
        password: currentPassword,
      });

      if (signInError) {
        return { error: "Current password is incorrect" };
      }
    }

    // Update the user's password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("Password update error:", error);
      return { error: error.message };
    }

    // Update the editor_profiles table to mark that the user has a password
    const { error: updateError } = await supabase
      .from("editor_profiles")
      .update({ has_password: true })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Failed to update editor profile:", updateError);
    }

    return {
      success: true,
      email: user.email,
      userId: user.id,
      isNewPassword: !userHasPassword,
    };
  } catch (err) {
    console.error("Server error:", err);
    return { error: "An unexpected error occurred" };
  }
}

export async function sendPasswordEmail({
  type,
  email,
  userId,
}: {
  type: "created" | "updated";
  email: string;
  userId: string;
}) {
  if (!email) {
    console.error("Cannot send email: No email address provided");
    return { error: "No email address provided" };
  }

  try {
    const emailTemplate =
      type === "created"
        ? PasswordSetEmail({ email })
        : PasswordUpdatedEmail({ email });

    // Send notification email TO THE USER
    await resend.emails.send({
      from: "Test <no-reply@test.com>",
      to: email,
      subject:
        type === "created"
          ? "Your Test password has been set"
          : "Your Test password has been updated",
      react: emailTemplate,
    });

    // Send admin notification (separate email)
    await resend.emails.send({
      from: "Test <no-reply@test.com>",
      to: "test@gmail.com",
      subject: `User ${type} password`,
      text: `User with email ${email} and ID ${userId} has ${type} their password.`,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send email notification:", error);
    return { error: "Failed to send email notification" };
  }
}