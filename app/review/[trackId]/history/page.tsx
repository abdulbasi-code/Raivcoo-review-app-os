// app/review/[trackId]/history/page.tsx
// @ts-nocheck
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import HistoryPage from "./HistoryPage";
import Link from "next/link";
import { RevButtons } from "@/components/ui/RevButtons";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const supabase = await createClient();
  const { trackId } = await params;
  if (!trackId || trackId === "undefined") {
    return {
      title: "Project History",
      robots: { index: false, follow: false },
    };
  }
  try {
    const { data: trackData } = await supabase
      .from("project_tracks")
      .select(`project:projects!inner(title)`)
      .eq("id", trackId)
      .maybeSingle();
    return {
      title: trackData?.project
        ? `History: ${trackData.project.title}`
        : "Project History",
      description: "Review project history.",
      robots: { index: false, follow: false },
    };
  } catch (error) {
    return {
      title: "Project History",
      robots: { index: false, follow: false },
    };
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = await params;
  const supabase = await createClient();

  if (!trackId || trackId === "undefined") {
    return notFound();
  }

  const { data: currentTrack, error: currentTrackError } = await supabase
    .from("project_tracks")
    .select(
      `id, project_id, round_number, steps, client_decision, created_at, updated_at,
       project:projects!inner(id, title, editor_id, client_name, client_email, password_protected)`
    )
    .eq("id", trackId)
    .maybeSingle();

  if (currentTrackError || !currentTrack || !currentTrack.project) {
    console.error("Error fetching track data:", currentTrackError);
    return notFound();
  }

  const { data: allTracks, error: allTracksError } = await supabase
    .from("project_tracks")
    .select(
      `
      id, 
      project_id, 
      round_number, 
      client_decision, 
      created_at,
      updated_at
    `
    )
    .eq("project_id", currentTrack.project_id)
    .order("round_number", { ascending: false });

  if (allTracksError) {
    console.error("Error fetching track history:", allTracksError);
    return (
      <div className="container mx-auto py-6 text-center mt-10">
        <h1 className="text-2xl font-bold mb-4">Error Loading History</h1>
        <p className="text-muted-foreground">
          Unable to load project history. Please try again later.
        </p>
        <Link href={`/review/${trackId}`} className="mt-4 inline-block">
          <RevButtons variant="outline">Back to Review</RevButtons>
        </Link>
      </div>
    );
  }

  // Fetch comments for ALL tracks in the project
  const trackIds = allTracks?.map((track) => track.id) || [];
  const { data: allCommentsData, error: commentsError } = await supabase
    .from("review_comments")
    .select(`id, comment, created_at, track_id`)
    .in("track_id", trackIds)
    .order("comment->timestamp", { ascending: true });

  if (commentsError) {
    console.error("Error fetching comments:", commentsError);
  }

  // Get client display name from project
  const clientDisplayName = currentTrack.project.client_name || "Client";

  const commentsByTrack = (allCommentsData || []).reduce(
    (acc, comment) => {
      if (!acc[comment.track_id]) {
        acc[comment.track_id] = [];
      }
      acc[comment.track_id].push({
        id: comment.id,
        created_at: comment.created_at,
        comment: comment.comment as {
          text: string;
          timestamp: number;
          images?: string[];
          links?: { url: string; text: string }[];
        },
        commenter_display_name: clientDisplayName,
        isOwnComment: false,
      });
      return acc;
    },
    {} as Record<string, any[]>
  );

  return (
    <HistoryPage
      currentTrack={currentTrack}
      allTracks={allTracks || []}
      commentsByTrack={commentsByTrack}
      clientName={clientDisplayName}
      projectTitle={currentTrack.project.title}
    />
  );
}