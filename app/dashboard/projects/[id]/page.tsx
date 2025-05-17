// app/dashboard/projects/[id]/page.tsx

import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { RevButtons } from "@/components/ui/RevButtons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  ArrowLeft,
  ShieldCheck,
  ShieldX,
  Hourglass,
  Lock,
} from "lucide-react";
import TrackManager from "./TrackManager";
import {
  updateProjectTrackStepStatus,
  updateStepContent,
  updateTrackStructure,
} from "./actions";
import { ProjectCommentsSection } from "./ProjectCommentsSection";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import {
  formatFullDate,
  formatStatus,
  getStatusDescription,
  getStatusDotColor,
  isDeadlineApproaching,
} from "../../components/libs";
import { Badge } from "@/components/ui/badge";

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
    title: project ? `${project.title} - Project Details` : "Project Details",
    description: "View and manage project details, tracks, and deliverables",
  };
}

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?message=Please log in to view projects");
  }

  const { data: editorProfile, error: profileError } = await supabase
    .from("editor_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (profileError || !editorProfile) {
    console.error(`Editor profile error for user ${user.id}`, profileError);
    redirect("/profile?message=Complete your profile setup");
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select(
      `id, title, description, status, deadline, created_at, editor_id, 
       client_name, client_email, password_protected`
    )
    .eq("id", id)
    .single();
  if (projectError || !project) {
    console.error(`Project ${id} fetch error:`, projectError);
    return notFound();
  }

  if (project.editor_id !== editorProfile.id) {
    console.warn(
      `Auth Fail: Editor ${editorProfile.id} accessing project ${id} owned by ${project.editor_id}.`
    );
    return notFound();
  }

  const { data: tracks, error: tracksError } = await supabase
    .from("project_tracks")
    .select(
      `id, project_id, round_number, status, steps, created_at, updated_at, client_decision, final_deliverable_media_type`
    )
    .eq("project_id", id)
    .order("round_number", { ascending: true });

  if (tracksError) {
    console.error(`Error fetching tracks for project ${id}:`, tracksError);
  }
  const tracksWithComments = await Promise.all(
    (tracks || []).map(async (track) => {
      const { data: comments } = await supabase
        .from("review_comments")
        .select("id, comment, created_at")
        .eq("track_id", track.id)
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
        commenter_display_name: "Client",
      }));

      return { ...track, comments: formattedComments };
    })
  );

  const latestTrack =
    tracksWithComments.length > 0
      ? tracksWithComments[tracksWithComments.length - 1]
      : null;

  if (!latestTrack && !tracksError && project) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2 text-muted-foreground mb-4 text-sm">
          <Link href="/projects" className="hover:underline flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Projects
          </Link>

          {project.client_name && (
            <span className="text-sm text-muted-foreground">
              {" • "} Client: {project.client_name}
              {project.password_protected && (
                <span className="ml-2 text-yellow-500 items-center inline-flex">
                  <Lock className="h-3 w-3 mr-1" />
                  Protected
                </span>
              )}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold">{project.title}</h1>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            This project does not have any workflow tracks yet.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tracksError && !latestTrack && project) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2 text-muted-foreground mb-4 text-sm">
          <Link href="/projects" className="hover:underline flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Projects
          </Link>

          {project.client_name && (
            <span className="text-sm text-muted-foreground">
              {" • "} Client: {project.client_name}
              {project.password_protected && (
                <span className="ml-2 text-yellow-500 items-center inline-flex">
                  <Lock className="h-3 w-3 mr-1" />
                  Protected
                </span>
              )}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold">{project.title}</h1>
        <Card>
          <CardContent className="py-10 text-center text-destructive">
            Error loading project workflow tracks. Please try again later.
            <p className="text-sm text-muted-foreground mt-1">
              ({tracksError?.message})
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <div className="relative w-fit">
            <h3 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)] bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.00)_202.08%)]">
              {project.title}
            </h3>

            <HoverCard openDelay={0} closeDelay={0}>
              <HoverCardTrigger asChild>
                <div
                  className={cn(
                    "absolute -top-0 border-2 -right-4 size-3 rounded-full cursor-default",
                    getStatusDotColor(project.status)
                  )}
                />
              </HoverCardTrigger>
              <HoverCardContent side="top" className="text-sm max-w-xs">
                <p className="font-medium">{formatStatus(project.status)}</p>
                <p className="text-muted-foreground text-xs mt-1">
                  {getStatusDescription(project.status)}
                </p>
              </HoverCardContent>
            </HoverCard>
          </div>
          <div className="flex md:flex-row flex-col w-full md:w-fit items-center gap-4 mt-2 text-sm ">
            <Badge
              variant={"outline"}
              className="flex justify-center w-full md:w-fit items-center gap-2"
            >
              <Calendar className="h-4 w-4 mr-1.5" />
              Created {formatFullDate(project.created_at)}
            </Badge>
            {project.deadline && (
              <Badge
                variant={
                  isDeadlineApproaching(project.deadline)
                    ? "warning"
                    : "outline"
                }
                className="flex justify-center w-full md:w-fit items-center gap-2"
              >
                <Clock className="h-4 w-4 mr-1.5" />
                Due {formatFullDate(project.deadline)}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {project.client_name && (
        <div className="flex items-center text-sm text-muted-foreground">
          <span>Client: {project.client_name}</span>
          {project.password_protected && (
            <span className="ml-2 text-yellow-500 items-center inline-flex">
              <Lock className="h-3 w-3 mr-1" />
              Protected
            </span>
          )}
          {project.client_email && (
            <span className="ml-2">({project.client_email})</span>
          )}
        </div>
      )}

      {project.description && (
        <Card className="space-y-3 p-4 border-2 border-dashed">
          <CardTitle className="">Description</CardTitle>

          <CardContent className="pt-6 p-0 text-sm text-muted-foreground whitespace-pre-line">
            {project.description}
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {latestTrack && (
          <>
            <h2 className="text-xl font-semibold ">Project Workflow</h2>
            <div className="mb-4">
              <TrackManager
                track={latestTrack}
                updateProjectTrackStepStatus={updateProjectTrackStepStatus}
                updateTrackStructure={updateTrackStructure}
                updateStepContent={updateStepContent}
              />
            </div>
            {latestTrack.client_decision !== "pending" && (
              <Card className="mt-6 border-0 bg-transparent mx-0 px-0 py-6">
                <CardContent className="pt-6 p-0 m-0">
                  {latestTrack.comments && latestTrack.comments.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Client Feedback:
                      </p>
                      <ProjectCommentsSection comments={latestTrack.comments} />
                    </div>
                  )}
                  {(!latestTrack.comments ||
                    latestTrack.comments.length === 0) &&
                    latestTrack.client_decision !== "approved" && (
                      <p className="text-sm text-muted-foreground mt-2">
                        No specific comments were provided for the requested
                        revisions.
                      </p>
                    )}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {tracksWithComments.length > 1 && (
          <div className="mt-16 ">
            <div className="text-lg text-center font-semibold mt-6 mb-4">
              <span className=" text-2xl items-center ">
                Previous Rounds History{" "}
              </span>
            </div>

            <div className="space-y-4">
              {tracksWithComments
                .filter((track) => track.id !== latestTrack?.id)
                .sort((a, b) => b.round_number - a.round_number)
                .map((track) => {
                  let decisionVariant: "success" | "destructive" | "outline" =
                    "outline";
                  let DecisionIcon = Hourglass;
                  let decisionText = "Status Unknown";

                  if (track.client_decision === "approved") {
                    decisionVariant = "success";
                    DecisionIcon = ShieldCheck;
                    decisionText = "Client Approved";
                  } else if (track.client_decision === "revisions_requested") {
                    decisionVariant = "destructive";
                    DecisionIcon = ShieldX;
                    decisionText = "Revisions Requested";
                  }

                  return (
                    <Card
                      key={track.id}
                      className="border-none p-0 m-0 bg-transparent"
                    >
                      <CardHeader className="p-0 m-0">
                        <div className="flex flex-wrap mb-2 justify-between items-center gap-2">
                          <CardTitle className=" font-medium">
                            Round {track.round_number}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <RevButtons
                              size="sm"
                              variant={decisionVariant}
                              className="flex items-center gap-1 text-xs px-2 py-0.5"
                            >
                              <DecisionIcon className="h-3.5 w-3.5" />
                              {decisionText}
                            </RevButtons>
                            <Link href={`/review/${track.id}`} passHref>
                              <RevButtons variant="secondary" size="sm">
                                View History
                              </RevButtons>
                            </Link>
                          </div>
                        </div>
                      </CardHeader>

                      {track.comments && track.comments.length > 0 && (
                        <CardContent className="p-0 m-0 mt-3">
                          <ProjectCommentsSection comments={track.comments} />
                        </CardContent>
                      )}
                      {track.client_decision === "revisions_requested" &&
                        (!track.comments || track.comments.length === 0) && (
                          <CardContent className="pt-0 pb-3 px-4 text-xs text-muted-foreground">
                            (No specific comments were provided)
                          </CardContent>
                        )}
                    </Card>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}