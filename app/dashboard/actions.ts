// app/dashboard/actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";

export interface SearchFilters {
  status?: "all" | "active" | "pending" | "completed";
  sortBy?: "created_at" | "updated_at" | "deadline" | "title";
  sortOrder?: "asc" | "desc";
  dateRange?: {
    from?: string;
    to?: string;
  };
  limit?: number; // Add limit parameter
}

export interface SearchResult {
  id: string;
  type: "project" | "client" | "track";
  title: string;
  subtitle?: string;
  url: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  deadline?: string;
}

export async function globalSearch(
  searchTerm: string = "",
  filters: SearchFilters = {}
): Promise<SearchResult[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: editorProfile } = await supabase
    .from("editor_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!editorProfile) return [];

  // Build the query
  let query = supabase
    .from("projects")
    .select(
      `
      id, 
      title, 
      status, 
      client_name,
      created_at,
      updated_at,
      deadline,
      description,
      project_tracks(
        id,
        round_number,
        status,
        created_at,
        updated_at
      )
    `
    )
    .eq("editor_id", editorProfile.id);

  // Apply search term only if it exists
  if (searchTerm && searchTerm.trim().length > 0) {
    query = query.or(
      `title.ilike.%${searchTerm}%,client_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
    );
  }

  // Apply status filter
  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  // Apply date range filter
  if (filters.dateRange?.from) {
    query = query.gte("created_at", filters.dateRange.from);
  }
  if (filters.dateRange?.to) {
    query = query.lte("created_at", filters.dateRange.to);
  }

  // Apply sorting
  const sortBy = filters.sortBy || "updated_at";
  const sortOrder = filters.sortOrder || "desc";
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  // Apply limit
  const limit = filters.limit || 20;
  query = query.limit(limit);

  const { data: projects, error } = await query;

  if (error) {
    console.error("Search error:", error);
    throw new Error("Failed to search projects");
  }

  const results: SearchResult[] = [];

  // Process project results
  if (projects) {
    results.push(
      ...projects.map((project) => ({
        id: project.id,
        type: "project" as const,
        title: project.title,
        subtitle: `Client: ${project.client_name} • ${formatStatus(project.status)}`,
        url: `/dashboard/projects/${project.id}`,
        status: project.status,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        deadline: project.deadline,
      }))
    );

    if (
      searchTerm &&
      (searchTerm.toLowerCase().includes("track") ||
        searchTerm.toLowerCase().includes("round"))
    ) {
      projects.forEach((project) => {
        if (project.project_tracks?.length > 0) {
          project.project_tracks.forEach((track) => {
            results.push({
              id: track.id,
              type: "track" as const,
              title: `${project.title} - Round ${track.round_number}`,
              subtitle: `Track Status: ${formatStatus(track.status)}`,
              url: `/dashboard/projects/${project.id}`,
              status: track.status,
              createdAt: track.created_at,
              updatedAt: track.updated_at,
            });
          });
        }
      });
    }
  }

  return results;
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}
