// app/dashboard/projects/actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProject(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  const { data: editorProfile } = await supabase
    .from("editor_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!editorProfile) {
    throw new Error("Editor profile not found.");
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, password_protected")
    .eq("id", projectId)
    .eq("editor_id", editorProfile.id)
    .single();

  if (projectError || !project) {
    console.error("Project query error:", projectError);
    throw new Error(
      "Project not found or you don't have permission to edit it."
    );
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const deadline = formData.get("deadline") as string;
  const client_name = formData.get("client_name") as string;
  const client_email = formData.get("client_email") as string;
  const password_protected =
    (formData.get("password_protected") as string) === "true";

  const access_password = formData.has("access_password")
    ? (formData.get("access_password") as string)
    : null;

  if (!title || title.trim().length === 0) {
    throw new Error("Project title cannot be empty.");
  }
  if (title.length > 255) {
    throw new Error("Project title is too long (max 255 chars).");
  }
  if (!client_name || client_name.trim().length === 0) {
    throw new Error("Client name cannot be empty.");
  }

  if (password_protected && !project.password_protected && !access_password) {
    throw new Error("Password is required when enabling protection.");
  }

  // Base update data
  const updateData: {
    title: string;
    description?: string | null;
    deadline?: string | null;
    client_name: string;
    client_email?: string | null;
    password_protected: boolean;
    updated_at: string;
    access_password?: string | null;
  } = {
    title: title.trim(),
    description: description?.trim() || null,
    deadline: deadline || null,
    client_name: client_name.trim(),
    client_email: client_email?.trim() || null,
    password_protected,
    updated_at: new Date().toISOString(),
  };

  if (access_password !== null) {
    updateData.access_password = access_password.trim();
  } else if (!password_protected) {
    updateData.access_password = null;
  }

  try {
    const { error: updateError } = await supabase
      .from("projects")
      .update(updateData)
      .eq("id", projectId);

    if (updateError) {
      console.error(`Error updating project ${projectId}:`, updateError);
      throw new Error(`Database error: ${updateError.message}`);
    }

    revalidatePath(`/dashboard/projects/${projectId}`);
    revalidatePath("/dashboard/projects");

    return { message: "Project updated successfully." };
  } catch (error) {
    console.error("Error in updateProject action:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to update project.");
  }
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  const { data: editorProfile } = await supabase
    .from("editor_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!editorProfile) {
    throw new Error("Editor profile not found.");
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, password_protected")
    .eq("id", projectId)
    .eq("editor_id", editorProfile.id)
    .single();

  if (projectError || !project) {
    console.error("Project query error:", projectError);
    throw new Error(
      "Project not found or you don't have permission to delete it."
    );
  }

  try {
    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (deleteError) {
      console.error(`Error deleting project ${projectId}:`, deleteError);
      if (deleteError.code === "23503") {
        throw new Error(`Cannot delete project: Related data might exist.`);
      }
      throw new Error(`Database error: ${deleteError.message}`);
    }

    // Revalidate paths
    revalidatePath(`/dashboard/projects/${projectId}`);
    revalidatePath("/dashboard/projects");

    return { message: "Project deleted successfully." };
  } catch (error) {
    console.error("Error in deleteProject action:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to delete project.");
  }
}
