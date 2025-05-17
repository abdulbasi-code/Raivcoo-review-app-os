"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import {
  ExternalLink,
  ShieldCheck,
  ShieldX,
  Hourglass,
  Flag,
  Clock,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { CommentTextWithLinks } from "@/app/dashboard/projects/[id]/CommentRenderer";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ProjectComments } from "./ProjectComments";
import { formatTime } from "@/app/review/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Comment,
  formatFullDate,
  formatStatus,
  getStatusDescription,
  getStatusDotColor,
  isDeadlineApproaching,
  Project,
  Track,
} from "@/app/dashboard/components/libs";



export default function LiveTrackClient({
  project,
  tracks,
  activeTrack,
  formattedComments,
}: {
  project: Project;
  tracks: Track[];
  activeTrack: Track;
  formattedComments: Comment[];
}) {
  // Image dialog state
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const [currentImageAlt, setCurrentImageAlt] = useState<string>("");

  // Image dialog handler
  const openImageDialog = (imageUrl: string, altText: string) => {
    setCurrentImageUrl(imageUrl);
    setCurrentImageAlt(altText);
    setImageDialogOpen(true);
  };

  const calculateTrackProgress = (track: Track) => {
    if (!track || !track.steps?.length) return 0;

    const completedSteps = track.steps.filter(
      (step) => step.status === "completed"
    ).length;
    return Math.round((completedSteps / track.steps.length) * 100);
  };

  const trackProgress = calculateTrackProgress(activeTrack);

  return (
    <div className="min-h-screen px-3 py-6 md:p-6 space-y-6">
      {/* Header with back button */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center relative w-fit gap-2">
            <h3 className="text-xl md:text-3xl font-bold tracking-tight text-transparent bg-clip-text dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)] bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.00)_202.08%)]">
              {project.title}
            </h3>

            <HoverCard openDelay={0} closeDelay={0}>
              <HoverCardTrigger asChild>
                <div
                  className={cn(
                    "absolute -top-0 border-2  -right-4 size-3 rounded-full cursor-default",
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
          <div className="flex flex-col gap-2 text-sm">
            {project.deadline && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p
                  className={
                    isDeadlineApproaching(project.deadline)
                      ? "text-orange-500 font-medium"
                      : ""
                  }
                >
                  Deadline: {formatFullDate(project.deadline)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Current track progress */}
      <Card className="">
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <span>Round {activeTrack.round_number}</span>
                <span className="text-muted-foreground text-sm hidden md:inline">
                  |
                </span>
                <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                  Last updated: {formatFullDate(activeTrack.updated_at)}
                </span>
              </CardTitle>
            </div>
            {activeTrack.client_decision && (
              <Badge
                variant={
                  activeTrack.client_decision === "approved"
                    ? "success"
                    : activeTrack.client_decision === "revisions_requested"
                      ? "destructive"
                      : "warning"
                }
                className="px-3 py-1"
              >
                {activeTrack.client_decision === "approved" ? (
                  <ShieldCheck className="h-4 w-4 mr-1" />
                ) : activeTrack.client_decision === "revisions_requested" ? (
                  <ShieldX className="h-4 w-4 mr-1" />
                ) : (
                  <Hourglass className="h-4 w-4 mr-1" />
                )}
                {activeTrack.client_decision === "approved"
                  ? "Approved"
                  : activeTrack.client_decision === "revisions_requested"
                    ? "Revisions Requested"
                    : "Pending Review"}
              </Badge>
            )}
          </div>

          {/* Progress tracking bar */}
          <div className="space-y-2 mt-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {activeTrack.steps?.filter(
                    (step) => step.status === "completed"
                  ).length || 0}
                  /{activeTrack.steps?.length || 0} steps completed
                </span>
              </div>
              <span className="text-sm font-medium">{trackProgress}%</span>
            </div>
            <Progress value={trackProgress} />
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Steps list */}
          <div className="space-y-5">
            {activeTrack.steps &&
              activeTrack.steps.map((step, index) => {
                const isFinalStep = index === activeTrack.steps.length - 1;
                const isCompleted = step.status === "completed";

                return (
                  <Card
                    key={index}
                    className={cn(
                      "p-4 border-0 border-t-2 border-r-2 border-b-2 border-dashed relative rounded-none rounded-tr-md rounded-br-md",
                      isCompleted
                        ? "bg-muted/5 border-muted"
                        : "border-muted/50"
                    )}
                  >
                    {/* Status indicator line */}
                    <div
                      className={cn(
                        "absolute left-0 top-0 bottom-0 w-1",
                        isCompleted ? "bg-green-500" : "bg-amber-400"
                      )}
                    />

                    <div className="flex flex-col items-start gap-3 pl-2">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <span className="font-medium">Step {index + 1}</span>
                        </div>

                        {isCompleted && (
                          <span className="text-xs text-muted-foreground">
                            Updated: {formatFullDate(activeTrack.updated_at)}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 w-full">
                        {isFinalStep && (
                          <div className="p-4 mb-4 border-2 border-dashed rounded-md text-sm bg-muted/10">
                            <div className="flex items-center gap-2">
                              <Flag className="h-4 w-4 text-primary" />
                              <h3 className="font-medium">Round Completion</h3>
                            </div>

                            {step.status === "completed" ? (
                              <div className="mt-2">
                                <p className="text-sm text-muted-foreground">
                                  The editor has marked this round as complete
                                </p>
                              </div>
                            ) : (
                              <TextShimmer
                                className="text-sm mt-2"
                                duration={2}
                              >
                                The editor is currently working on this round
                              </TextShimmer>
                            )}
                          </div>
                        )}

                        {step.metadata && (
                          <div className="space-y-3 mb-6">
                            {step.metadata.text && (
                              <div className="p-3 border-2 border-dashed rounded-md text-sm bg-card ">
                                <CommentTextWithLinks
                                  text={step.metadata.text}
                                  links={step.metadata.links}
                                />
                              </div>
                            )}

                            {step.metadata.images &&
                              step.metadata.images.length > 0 && (
                                <div className="flex flex-wrap gap-3">
                                  {step.metadata.images.map((imageUrl, idx) => (
                                    <div
                                      key={`${imageUrl}-${idx}`}
                                      className="inline-block"
                                      onClick={() =>
                                        openImageDialog(
                                          imageUrl,
                                          `Reference image ${idx + 1}`
                                        )
                                      }
                                    >
                                      <div className="relative rounded-md overflow-hidden border border-muted hover:border-primary transition-colors cursor-pointer">
                                        <Image
                                          src={imageUrl}
                                          alt={`Reference image ${idx + 1}`}
                                          height={160}
                                          width={0}
                                          className="max-h-[160px] w-auto group-hover:opacity-90 transition-opacity"
                                          style={{ display: "block" }}
                                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <ExternalLink className="h-6 w-6 text-white" />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        )}

                        {step.deliverable_link && (
                          <div className="mt-3">
                            <Link
                              href={step.deliverable_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-600 hover:underline text-sm bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View Deliverable
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Timestamp indicator */}
                      {step.metadata?.timestamp !== undefined && (
                        <div className="absolute bottom-2 right-3 flex items-center  gap-1 text-xs px-1.5 py-0.5 bg-secondary/40 rounded-full text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span className="font-mono">
                            {formatTime(step.metadata.timestamp)}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
          </div>

          {/* Client feedback section*/}
          {formattedComments.length > 0 && (
            <div className="mt-8 border-t pt-6">
              <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Original Client Feedback
              </h3>
              <ProjectComments
                comments={formattedComments}
                formatFullDate={formatFullDate}
                openImageDialog={openImageDialog}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Previous rounds */}
      {tracks.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <div className="flex items-center justify-center bg-muted text-muted-foreground rounded-full w-7 h-7 text-sm">
                {tracks.length - 1}
              </div>
              Previous Rounds
            </CardTitle>
            <CardDescription>
              History of previous revision rounds for this project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tracks
                .filter((track) => track.id !== activeTrack.id)
                .map((track) => {
                  const finalStep = track.steps?.find(
                    (_, index) => index === track.steps.length - 1
                  );
                  const trackProgress = calculateTrackProgress(track);

                  return (
                    <Card
                      key={track.id}
                      className="border hover:border-primary/40 transition-colors"
                    >
                      <CardHeader className="pb-2 border-b bg-muted/10">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">
                              Round {track.round_number}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            {track.client_decision && (
                              <Badge
                                variant={
                                  track.client_decision === "approved"
                                    ? "success"
                                    : track.client_decision ===
                                        "revisions_requested"
                                      ? "destructive"
                                      : "info"
                                }
                                className="text-xs"
                              >
                                {track.client_decision === "approved"
                                  ? "Approved"
                                  : track.client_decision ===
                                      "revisions_requested"
                                    ? "Revisions"
                                    : "Pending"}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatFullDate(track.updated_at)}
                        </span>
                      </CardHeader>
                      <CardContent className="pt-3 pb-1 mb-2">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center  text-xs">
                            <span className="text-muted-foreground">
                              {track.steps?.filter(
                                (s) => s.status === "completed"
                              ).length || 0}{" "}
                              of {track.steps?.length || 0} steps completed
                            </span>
                            <span>{trackProgress}%</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-3 pb-3 border-t">
                        {finalStep?.deliverable_link && (
                          <Link
                            href={`/review/${track.id}`}
                            className="flex w-full items-center justify-between text-[#8C5CF6] hover:underline text-sm group"
                          >
                            <span className="flex items-center">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View Round Details
                            </span>
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-6xl w-[95vw] p-4 max-h-[95vh]">
          <DialogHeader className="flex flex-row justify-between items-center p-2"></DialogHeader>
          <div className="overflow-auto flex justify-center items-center bg-black border border-muted rounded-md max-h-[calc(95vh-100px)]">
            <img
              src={currentImageUrl}
              alt={currentImageAlt}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                display: "block",
              }}
              className="h-auto"
            />
          </div>
        </DialogContent>
      </Dialog>
      <a href="https://test.com">
        <span className="text-xs text-muted-foreground text-center hover:underline flex justify-center items-center mt-6">
          Powered by test.com
        </span>
      </a>
    </div>
  );
}
