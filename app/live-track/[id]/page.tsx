// app/live-track/[id]/page.tsx
// @ts-nocheck
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import LiveTrackClient from "./LiveTrackClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;
  const { data: project } = await supabase
    .from("projects")
    .select("title")
    .eq("id", id)
    .single();

  return {
    title: project ? `Live Track: ${project.title}` : "Project Live Track",
    description: "Real-time tracking of your video project status",
  };
}

export default async function LiveTrackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  // Fetch project with client information directly from the projects table
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select(
      `
      id,
      title,
      description,
      status,
      deadline,
      created_at,
      client_name,
      client_email,
      password_protected
    `
    )
    .eq("id", id)
    .single();

  if (projectError || !project) {
    return notFound();
  }

  // Fetch tracks for this project with comments
  const { data: tracks, error: tracksError } = await supabase
    .from("project_tracks")
    .select(
      `
      id,
      project_id,
      round_number,
      status,
      steps,
      client_decision,
      created_at,
      updated_at
    `
    )
    .eq("project_id", id)
    .order("round_number", { ascending: true });

  if (tracksError || !tracks || tracks.length === 0) {
    return (
      <div className="container mx-auto py-6 mt-24">
        <Link
          href={`/dashboard/projects/${id}`}
          className="text-blue-500 hover:underline flex items-center mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to project
        </Link>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              No track information available for this project.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get current active track
  const activeTrack =
    tracks.find((track) => track.status === "in_progress") ||
    tracks[tracks.length - 1];

  // Fetch comments for the active track
  const { data: comments } = await supabase
    .from("review_comments")
    .select("id, comment, created_at")
    .eq("track_id", activeTrack.id)
    .order("comment->timestamp", { ascending: true });

  const formattedComments = (comments || []).map((comment: any) => ({
    id: comment.id,
    created_at: comment.created_at,
    comment: {
      text: comment.comment.text || "",
      timestamp: comment.comment.timestamp || 0,
      images: comment.comment.images || [],
      links: comment.comment.links || [],
    },
  }));

  return (
    <LiveTrackClient
      project={project}
      tracks={tracks}
      activeTrack={activeTrack}
      formattedComments={formattedComments}
    />
  );
}
