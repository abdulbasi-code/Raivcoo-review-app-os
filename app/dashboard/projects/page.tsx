// app/dashboard/projects/page.tsx

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AllProjectsPageClient from "./components/AllProjectsPageClient";
import { Metadata } from "next";
import { Project } from "../components/libs";

export const metadata: Metadata = {
  title: "All Projects | test",
  description: "View and manage all your video editing projects.",
};

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login?message=Please log in.");
  }

  const { data: editorProfile, error: profileError } = await supabase
    .from("editor_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (profileError || !editorProfile) {
    return redirect("/account?error=Editor Account needed");
  }

  let projects: Project[] = [];
  try {
    const { data: projectsData, error: projectsError } = await supabase
      .from("projects")
      .select(
        `
        id, 
        title,
        description,
        status,
        deadline,
        created_at,
        updated_at,
        client_name,
        client_email,
        password_protected,
        project_tracks(
          id, 
          round_number, 
          status, 
          client_decision,
          steps,
          created_at, 
          updated_at
        )
      `
      )
      .eq("editor_id", editorProfile.id)
      .order("updated_at", { ascending: false });

    if (projectsError) {
      console.error(`Error fetching projects:`, projectsError);
      throw new Error("Failed to load projects");
    }

    projects = (projectsData || []).map((project) => {
      const latestTrack =
        project.project_tracks?.length > 0
          ? [...project.project_tracks].sort((a, b) => {
              const timestampA = new Date(
                a.updated_at && a.updated_at !== a.created_at
                  ? a.updated_at
                  : a.created_at
              ).getTime();

              const timestampB = new Date(
                b.updated_at && b.updated_at !== b.created_at
                  ? b.updated_at
                  : b.created_at
              ).getTime();

              return timestampB - timestampA;
            })[0]
          : null;

      return {
        ...project,
        latestTrack,
        latestTrackUpdate:
          latestTrack?.updated_at || latestTrack?.created_at || null,
      };
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    throw err;
  }

  return <AllProjectsPageClient initialProjects={projects} />;
}