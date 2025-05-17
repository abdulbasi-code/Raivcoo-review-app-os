// app/review/[trackId]/page.tsx
// @ts-nocheck
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ReviewPage from "./ReviewPage";
import PasswordProtectionPage from "./components/PasswordProtectionPage";
import Link from "next/link";
import { RevButtons } from "@/components/ui/RevButtons";
import {
  addReviewComment,
  clientApproveProject,
  clientRequestRevisions,
  deleteReviewComment,
  updateReviewComment,
  verifyProjectPassword,
} from "./actions";
import { cookies } from "next/headers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const supabase = await createClient();
  const { trackId } = await params;
  if (!trackId || trackId === "undefined") {
    return { title: "Project Review", robots: { index: false, follow: false } };
  }
  try {
    const { data: trackData }: any = await supabase
      .from("project_tracks")
      .select(`project:projects!inner(title)`)
      .eq("id", trackId)
      .maybeSingle();
    return {
      title: trackData?.project
        ? `Review: ${trackData.project.title}`
        : "Project Review",
      description: "Review project deliverable.",
      robots: { index: false, follow: false },
    };
  } catch (error) {
    return { title: "Project Review", robots: { index: false, follow: false } };
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

  const { data: trackBasic, error: trackBasicError } = await supabase
    .from("project_tracks")
    .select(`project_id`)
    .eq("id", trackId)
    .maybeSingle();

  if (trackBasicError || !trackBasic) {
    console.error(`Error fetching basic track data for ${trackId}`);
    return notFound();
  }

  const { data: projectProtection, error: protectionError } = await supabase
    .from("projects")
    .select(`password_protected`)
    .eq("id", trackBasic.project_id)
    .maybeSingle();

  if (protectionError || !projectProtection) {
    console.error(
      `Error fetching project protection status for ${trackBasic.project_id}`
    );
    return notFound();
  }

  if (projectProtection.password_protected) {
    const cookieStore = cookies();
    const projectPasswordVerified = (await cookieStore).get(
      `project_auth_${trackBasic.project_id}`
    );

    if (!projectPasswordVerified) {
      return (
        <PasswordProtectionPage
          trackId={trackId}
          projectId={trackBasic.project_id}
          verifyPasswordAction={verifyProjectPassword}
        />
      );
    }
  }

  const { data: trackData, error: trackFetchError }: any = await supabase
    .from("project_tracks")
    .select(
      `id, project_id, round_number, steps, client_decision,
       final_deliverable_media_type,
      project:projects!inner(id, title)`
    )
    .eq("id", trackId)
    .maybeSingle();

  if (trackFetchError || !trackData || !trackData.project) {
    console.error(
      `Error fetching review data for track ${trackId}:`,
      trackFetchError?.message || "Not found/Invalid data"
    );
    return notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  const steps = Array.isArray(trackData?.steps) ? trackData.steps : [];
  const finishStep = steps.find((step: any) => step.is_final);
  const deliverableLink = finishStep?.deliverable_link;
  const deliverableMediaType = trackData?.final_deliverable_media_type as
    | "video"
    | "image"
    | null
    | undefined;

  if (!deliverableLink) {
    return (
      <div className="container mx-auto py-6 text-center mt-10">
        <h1 className="text-2xl font-bold mb-4">Review Not Ready Yet</h1>
        <p className="text-muted-foreground">
          Deliverable for Round {trackData.round_number} has not been submitted
          yet.
        </p>
        <Link href="/projects" className="mt-4 inline-block">
          <RevButtons variant="outline">Back to Projects</RevButtons>
        </Link>
      </div>
    );
  }

  // Fetch comments for this track
  const { data: commentsData, error: commentsError } = await supabase
    .from("review_comments")
    .select(`id, comment, created_at, commenter_name, commenter_id`)
    .eq("track_id", trackId)
    .order("comment->timestamp", { ascending: true });

  if (commentsError) {
    console.error(
      `Error fetching comments for track ${trackId}:`,
      commentsError
    );
  }

  // Format comments for display
  const comments = (commentsData || []).map((c: any) => {
    const commenterName = c.commenter_name || "Anonymous Visitor";

    let isOwnComment = isAuthenticated && user && c.commenter_id === user.id;

    return {
      id: c.id,
      created_at: c.created_at,
      comment: c.comment as {
        text: string;
        timestamp: number;
        images?: string[];
        links?: { url: string; text: string }[];
      },
      commenter_display_name: commenterName,
      isOwnComment: isOwnComment,
    };
  });

  return (
    <div className=" xl:container mx-auto py-6 flex justify-center">
      <ReviewPage
        track={{
          id: trackData.id,
          projectId: trackData.project_id,
          roundNumber: trackData.round_number,
          clientDecision: trackData.client_decision as any,
        }}
        project={{ id: trackData.project.id, title: trackData.project.title }}
        deliverableLink={deliverableLink || ""}
        deliverableMediaType={deliverableMediaType}
        initialComments={comments}
        addCommentAction={addReviewComment}
        approveProjectAction={clientApproveProject}
        requestRevisionsAction={clientRequestRevisions}
        updateCommentAction={updateReviewComment}
        deleteCommentAction={deleteReviewComment}
        isAuthenticated={isAuthenticated}
        userId={user?.id || null}
      />
    </div>
  );
}