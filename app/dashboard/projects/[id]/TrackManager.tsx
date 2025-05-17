// aa/app/dashboard/projects/[id]/TrackManager.tsx
// @ts-nocheck

"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Loader2,
  ArrowLeft,
  Eye,
  Copy,
  Hourglass,
  ShieldCheck,
  ShieldX,
  Edit,
  Video,
  Image as ImageIcon,
} from "lucide-react";

import { StepCommentsSection } from "./StepCommentsSection";
import { EditableStepsList } from "../components/EditableStepsList";
import { RevButtons } from "@/components/ui/RevButtons";
import { cn } from "@/lib/utils";
import { formatTime } from "@/app/review/lib/utils";

export interface Step {
  name?: string;
  status: "pending" | "completed";
  is_final?: boolean;
  deliverable_link?: string | null;
  metadata?: {
    type: "comment" | "general_revision";
    comment_id?: string;
    text?: string;
    timestamp?: number;
    images?: string[];
    links?: { url: string; text: string }[];
    created_at?: string;
    step_index?: number;
  };
}

interface Track {
  id: string;
  project_id: string;
  round_number: number;
  status: string;
  client_decision: string;
  steps: Step[];
  created_at: string;
  updated_at: string;
  final_deliverable_media_type?: "video" | "image" | null;
}

interface TrackManagerProps {
  track: Track;
  updateProjectTrackStepStatus: (
    trackId: string,
    stepIndex: number,
    status: "pending" | "completed",
    linkValue?: string,
    finalMediaType?: "video" | "image"
  ) => Promise<any>;
  updateTrackStructure: (
    trackId: string,
    newStepsStructure: Omit<Step, "status" | "deliverable_link" | "is_final">[]
  ) => Promise<any>;
  updateStepContent: (formData: FormData) => Promise<any>;
}

export default function TrackManager({
  track,
  updateProjectTrackStepStatus,
  updateTrackStructure,
  updateStepContent,
}: TrackManagerProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<number | null>(null);
  const [isSubmittingDeliverable, setIsSubmittingDeliverable] = useState(false);
  const [deliverableLink, setDeliverableLink] = useState("");
  const [deliverableMediaType, setDeliverableMediaType] = useState<
    "video" | "image" | ""
  >("");
  const [isCommentsEditMode, setIsCommentsEditMode] = useState(false);
  const [editableSteps, setEditableSteps] = useState<Step[]>([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const originalSteps = useMemo(() => track.steps || [], [track.steps]);

  useEffect(() => {
    setEditableSteps(originalSteps);
  }, [originalSteps]);

  const finalStepIndexOriginal = useMemo(
    () => originalSteps.findIndex((step) => step.is_final),
    [originalSteps]
  );
  const finalStepOriginal = useMemo(
    () =>
      finalStepIndexOriginal !== -1
        ? originalSteps[finalStepIndexOriginal]
        : null,
    [originalSteps, finalStepIndexOriginal]
  );

  useEffect(() => {
    setDeliverableLink(finalStepOriginal?.deliverable_link || "");
    setDeliverableMediaType(track.final_deliverable_media_type || "");
  }, [finalStepOriginal?.deliverable_link, track.final_deliverable_media_type]);

  const allOtherStepsCompletedOriginal = useMemo(
    () =>
      finalStepIndexOriginal !== -1
        ? originalSteps
            .filter((_, i) => i !== finalStepIndexOriginal)
            .every((step) => step.status === "completed")
        : originalSteps.every((step) => step.status === "completed"),
    [originalSteps, finalStepIndexOriginal]
  );
  const isFinalStepCompletedOriginal =
    finalStepOriginal?.status === "completed";
  const isAwaitingClient =
    isFinalStepCompletedOriginal && track.client_decision === "pending";
  const isClientActionDone = track.client_decision !== "pending";
  const isTrackComplete =
    allOtherStepsCompletedOriginal && isFinalStepCompletedOriginal;

  const handleUpdateStepStatus = useCallback(
    async (
      stepIndex: number,
      newStatus: "pending" | "completed",
      linkValueOverride?: string,
      mediaTypeValueOverride?: "video" | "image"
    ) => {
      if (isClientActionDone) return;
      const stepToUpdate = originalSteps[stepIndex];
      if (!stepToUpdate) return;
      const isFinal = stepToUpdate.is_final;

      if (!isFinal && isTrackComplete && newStatus === "completed") {
        toast({
          title: "Action Not Allowed",
          description: "You must revert the final submission first.",
        });
        return;
      }

      const linkForCheck = isFinal ? deliverableLink : linkValueOverride;
      const typeForCheck = isFinal
        ? deliverableMediaType
        : mediaTypeValueOverride;

      if (
        isFinal &&
        newStatus === "completed" &&
        !allOtherStepsCompletedOriginal
      ) {
        toast({
          title: "Action Required",
          description: "All other steps must be complete first.",
        });
        return;
      }
      if (isFinal && newStatus === "completed" && !linkForCheck?.trim()) {
        toast({
          title: "Action Required",
          description: "Please provide the deliverable link.",
        });
        return;
      }
      if (
        isFinal &&
        newStatus === "completed" &&
        linkForCheck?.trim() &&
        !typeForCheck
      ) {
        toast({
          title: "Action Required",
          description: "Please select the deliverable media type.",
        });
        return;
      }

      setIsUpdatingStatus(stepIndex);
      try {
        const finalLinkParam =
          isFinal && newStatus === "completed" ? deliverableLink : undefined;
        const finalTypeParam =
          isFinal && newStatus === "completed"
            ? deliverableMediaType
            : undefined;

        await updateProjectTrackStepStatus(
          track.id,
          stepIndex,
          newStatus,
          finalLinkParam,
          finalTypeParam as "video" | "image" | undefined
        );

        if (isFinal && newStatus === "pending") {
          setDeliverableLink("");
          setDeliverableMediaType("");
        }
      } catch (error: any) {
        console.error(`Error updating step ${stepIndex}:`, error);
        toast({
          title: "Error",
          description: error.message || `Failed to update step`,
          variant: "destructive",
        });
      } finally {
        setIsUpdatingStatus(null);
      }
    },
    [
      isClientActionDone,
      originalSteps,
      allOtherStepsCompletedOriginal,
      deliverableLink,
      deliverableMediaType,
      updateProjectTrackStepStatus,
      track.id,
      isTrackComplete,
    ]
  );

  const handleSubmitDeliverable = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (finalStepIndexOriginal === -1 || isClientActionDone) return;
      if (!deliverableLink.trim()) {
        toast({
          title: "Error",
          description: "Please provide a deliverable link",
          variant: "destructive",
        });
        return;
      }
      if (!deliverableMediaType) {
        toast({
          title: "Error",
          description: "Please select the deliverable media type.",
          variant: "destructive",
        });
        return;
      }
      if (!allOtherStepsCompletedOriginal) {
        toast({
          title: "Error",
          description: "Complete all other steps first",
          variant: "destructive",
        });
        return;
      }

      setIsSubmittingDeliverable(true);
      await handleUpdateStepStatus(finalStepIndexOriginal, "completed");
      setIsSubmittingDeliverable(false);
    },
    [
      finalStepIndexOriginal,
      isClientActionDone,
      deliverableLink,
      deliverableMediaType,
      allOtherStepsCompletedOriginal,
      handleUpdateStepStatus,
    ]
  );

  const copyReviewLink = useCallback((projectId: string, trackId: string) => {
    if (!projectId || !trackId) return;
    const reviewUrl = `${window.location.origin}/review/${trackId}`;
    navigator.clipboard.writeText(reviewUrl);
    toast({
      title: "Review link copied!",
      description: "Share this link with your client.",
      variant: "success",
    });
  }, []);

  const handleSaveStepContent = useCallback(
    async (formData: FormData) => {
      if (!updateStepContent || isClientActionDone) return;
      try {
        await updateStepContent(formData);
        toast({
          title: "Success",
          description: "Step content updated.",
          variant: "success",
        });
      } catch (error) {
        console.error("Error updating step content:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to update step content",
          variant: "destructive",
        });
        throw error;
      }
    },
    [updateStepContent, isClientActionDone]
  );

  const handleSaveStepsChanges = useCallback(
    async (updatedSteps: Step[]) => {
      if (!updateTrackStructure || isClientActionDone) return;
      setIsSavingOrder(true);
      try {
        const newStructure = updatedSteps
          .filter((step) => !step.is_final)
          .map((step) => ({
            name: step.name,
            metadata: {
              comment_id: step.metadata?.comment_id,
              text: step.metadata?.text,
              images: step.metadata?.images,
              links: step.metadata?.links,
              type: step.metadata?.type,
              created_at: step.metadata?.created_at,
            },
          }));

        await updateTrackStructure(track.id, newStructure);
        toast({
          title: "Success",
          description: "Workflow steps updated.",
          variant: "success",
        });
        setIsCommentsEditMode(false);
      } catch (error) {
        console.error("Error saving steps:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to save steps",
          variant: "destructive",
        });
      } finally {
        setIsSavingOrder(false);
      }
    },
    [updateTrackStructure, track.id, isClientActionDone]
  );

  let displayStatus = "In Progress";
  let statusVariant: "warning" | "success" | "info" | "destructive" = "warning";
  let StatusIcon = Clock;
  if (isAwaitingClient) {
    displayStatus = "Awaiting Client Review";
    statusVariant = "warning";
    StatusIcon = Hourglass;
  } else if (track.client_decision === "approved") {
    displayStatus = "Client Approved";
    statusVariant = "success";
    StatusIcon = ShieldCheck;
  } else if (track.client_decision === "revisions_requested") {
    displayStatus = "Client Requested Revisions";
    statusVariant = "destructive";
    StatusIcon = ShieldX;
  }

  const stepsToRender = isCommentsEditMode ? editableSteps : originalSteps;

  const shouldShowFinalSubmission =
    !isCommentsEditMode &&
    finalStepOriginal &&
    !isFinalStepCompletedOriginal &&
    allOtherStepsCompletedOriginal &&
    !isClientActionDone;
  const shouldShowDeliverableCompleted =
    !isCommentsEditMode &&
    finalStepOriginal &&
    isFinalStepCompletedOriginal &&
    !isClientActionDone;

  return (
    <Card className="">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3 flex-wrap rounded-xl">
            <CardTitle className="text-lg sm:text-xl">
              Round {track.round_number}
            </CardTitle>
            <Badge
              variant={statusVariant}
              className="flex items-center gap-1 text-xs sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1"
            >
              <StatusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {displayStatus}
            </Badge>
          </div>
          {!isClientActionDone && (
            <div className="flex items-center gap-2">
              {isCommentsEditMode ? (
                <RevButtons
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => {
                    setIsCommentsEditMode(false);
                    setEditableSteps(originalSteps);
                  }}
                  disabled={isSavingOrder}
                >
                  Cancel Editing
                </RevButtons>
              ) : (
                <RevButtons
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => {
                    setEditableSteps([...originalSteps]);
                    setIsCommentsEditMode(true);
                  }}
                  disabled={isClientActionDone || isTrackComplete}
                >
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit Steps</span>
                </RevButtons>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <hr className="mb-4" />
      <CardContent>
        {stepsToRender.length > 0 ? (
          isCommentsEditMode ? (
            <EditableStepsList
              trackId={track.id}
              steps={editableSteps}
              onSave={handleSaveStepsChanges}
              onCancel={() => {
                setIsCommentsEditMode(false);
                setEditableSteps(originalSteps);
              }}
              updateStepContent={handleSaveStepContent}
              isSaving={isSavingOrder}
            />
          ) : (
            <div className="space-y-3">
              {stepsToRender.map((step, index) => {
                if (step.is_final) return null;

                const isCompleted = step.status === "completed";
                const isLoadingStatus = isUpdatingStatus === index;
                const canInteract =
                  !isClientActionDone && (!isTrackComplete || !isCompleted);
                const canRevert =
                  isCompleted && canInteract && !isTrackComplete;
                const canComplete = !isCompleted && canInteract;

                const viewKey = `step-view-${track.id}-${step.metadata?.comment_id || index}`;

                return (
                  <div
                    key={viewKey}
                    className={cn(
                      "flex flex-col",
                      isClientActionDone || (isTrackComplete && isCompleted)
                        ? "opacity-75"
                        : ""
                    )}
                  >
                    <div className="flex justify-end items-end w-full mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap justify-end w-full sm:w-auto pl-7 sm:pl-0 mt-2 sm:mt-0">
                        {canRevert && (
                          <RevButtons
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleUpdateStepStatus(index, "pending")
                            }
                            disabled={isLoadingStatus}
                            title="Revert to pending"
                            className={
                              isLoadingStatus
                                ? "cursor-not-allowed opacity-50"
                                : ""
                            }
                          >
                            {isLoadingStatus ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ArrowLeft className="h-4 w-4 mr-1" />
                            )}
                            <span className="hidden sm:inline">Revert</span>
                          </RevButtons>
                        )}
                        {canComplete && (
                          <RevButtons
                            size="sm"
                            variant="success"
                            onClick={() =>
                              handleUpdateStepStatus(index, "completed")
                            }
                            disabled={isLoadingStatus}
                            title="Mark as complete"
                            className={
                              isLoadingStatus
                                ? "cursor-not-allowed opacity-50"
                                : ""
                            }
                          >
                            {isLoadingStatus ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ...
                              </>
                            ) : (
                              "Mark Complete"
                            )}
                          </RevButtons>
                        )}
                      </div>
                    </div>

                    <Card
                      key={index}
                      className={cn(
                        "p-4 border-0 border-t-2 border-r-2 border-b-2 border-dashed relative rounded-none rounded-tr-md rounded-br-md",
                        isCompleted
                          ? "bg-muted/5 border-muted"
                          : "border-muted/50"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute left-0 top-0 bottom-0 w-1",
                          isCompleted ? "bg-green-500" : "bg-amber-400"
                        )}
                      />

                      <div className="flex flex-col items-start gap-3 pl-2">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <span className="font-medium">
                              Step {index + 1}
                            </span>
                          </div>

                          {isCompleted && (
                            <span className="text-xs text-muted-foreground"></span>
                          )}
                        </div>

                        <div className="flex-1 w-full">
                          <StepCommentsSection
                            step={step}
                            isFinalStep={false}
                          />
                        </div>

                        {step.metadata?.timestamp !== undefined && (
                          <div className="absolute bottom-2 right-3 flex items-center gap-1 text-xs px-1.5 py-0.5 bg-secondary/40 rounded-full text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span className="font-mono">
                              At {formatTime(step.metadata.timestamp)}
                            </span>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="py-10 text-center text-muted-foreground">
            This track has no defined steps.
          </div>
        )}

        {shouldShowFinalSubmission && (
          <form
            onSubmit={handleSubmitDeliverable}
            className="mt-5 pt-4 border-t space-y-4"
          >
            <Label className="font-medium text-base block">
              Submit Final Deliverable (Round {track.round_number})
            </Label>
            <div>
              <Label
                htmlFor={`deliverable-link-${track.id}`}
                className="text-sm font-normal"
              >
                Deliverable Link
              </Label>
              <Input
                id={`deliverable-link-${track.id}`}
                type="url"
                placeholder="Paste shareable video or image link..."
                value={deliverableLink}
                onChange={(e) => setDeliverableLink(e.target.value)}
                className="flex-1 h-10"
                required
                disabled={isSubmittingDeliverable}
              />
            </div>
            <div>
              <Label className="text-sm font-normal mb-2 block">
                Media Type
              </Label>
              <RadioGroup
                value={deliverableMediaType}
                onValueChange={(value: "video" | "image") =>
                  setDeliverableMediaType(value)
                }
                className="flex gap-4"
                disabled={isSubmittingDeliverable}
                required
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="video" id={`type-video-${track.id}`} />
                  <Label
                    htmlFor={`type-video-${track.id}`}
                    className="flex items-center gap-1 cursor-pointer"
                  >
                    {" "}
                    <Video className="h-4 w-4" /> Video
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="image" id={`type-image-${track.id}`} />
                  <Label
                    htmlFor={`type-image-${track.id}`}
                    className="flex items-center gap-1 cursor-pointer"
                  >
                    {" "}
                    <ImageIcon className="h-4 w-4" /> Image
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex justify-end">
              <RevButtons
                type="submit"
                variant="success"
                className="h-10"
                disabled={
                  !deliverableLink.trim() ||
                  !deliverableMediaType ||
                  isSubmittingDeliverable
                }
                title="Submit and Complete Round"
              >
                {isSubmittingDeliverable && (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                )}
                Submit & Complete Round
              </RevButtons>
            </div>
          </form>
        )}

        {shouldShowDeliverableCompleted && (
          <div className="mt-5 pt-4 border-t space-y-2">
            <Label className="font-medium text-base block text-green-600">
              Deliverable Submitted (Awaiting Client Review)
            </Label>
            <p className="text-sm text-muted-foreground">
              Link:{" "}
              <a
                href={finalStepOriginal.deliverable_link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="underline break-all"
              >
                {finalStepOriginal.deliverable_link}
              </a>
            </p>
            <p className="text-sm text-muted-foreground">
              Type:{" "}
              <span className="capitalize">
                {track.final_deliverable_media_type || "N/A"}
              </span>
            </p>
            <RevButtons
              size="sm"
              variant="outline"
              onClick={() =>
                handleUpdateStepStatus(finalStepIndexOriginal, "pending")
              }
              disabled={isUpdatingStatus === finalStepIndexOriginal}
              title="Revert submission"
              className={
                isUpdatingStatus === finalStepIndexOriginal
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }
            >
              {isUpdatingStatus === finalStepIndexOriginal ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <ArrowLeft className="h-4 w-4 mr-1" />
              )}
              Revert Submission
            </RevButtons>
          </div>
        )}

        {!isCommentsEditMode && isTrackComplete && !isClientActionDone && (
          <div className="mt-6 border-t pt-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Link href={`/review/${track.id}`} passHref className="flex-1">
                <RevButtons className="w-full" variant="outline">
                  <Eye className="h-4 w-4 mr-2" /> View Client Review Page
                </RevButtons>
              </Link>
              <RevButtons
                className="flex-1"
                variant="info"
                onClick={() => copyReviewLink(track.project_id, track.id)}
              >
                <Copy className="h-4 w-4 mr-2" /> Copy Client Review Link
              </RevButtons>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
