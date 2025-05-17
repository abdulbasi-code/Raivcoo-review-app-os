import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import SignUpForm from "./signup";

export const metadata: Metadata = {
  title: "Sign Up - Test",
  description:
    "Create a free Test account to start building your video editing portfolio today. Share your projects and connect with potential clients.",
};

export default async function SignUpPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/");
  }

  return <SignUpForm />;
}
