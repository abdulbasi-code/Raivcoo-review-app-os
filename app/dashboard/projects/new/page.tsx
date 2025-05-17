// app/projects/new/page.tsx

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ProjectForm from "./ProjectForm";
import { createProject } from "../[id]/actions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create New Project - Video Editor Dashboard",
  description: "Create a new video editing project",
};

export default async function NewProjectPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: editorProfile, error: profileError } = await supabase
    .from("editor_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (profileError) {
    redirect("/profile");
  }

  return (
    <div className="min-h-screen py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-center tracking-tight text-transparent bg-clip-text dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)] bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.00)_202.08%)]">
          Create New Project
        </h1>
        <p className="text-muted-foreground text-center">
          Please fill in the form below to create a new project.
        </p>
      </div>

      <ProjectForm createProject={createProject} />
    </div>
  );
}