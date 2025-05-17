// app/review/[trackId]/ReviewPage.tsx
"use client";

import React, { useState, useTransition, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevButtons } from "@/components/ui/RevButtons";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Check,
  Edit,
  ThumbsUp,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatTime } from "../lib/utils";
import { MediaContainer } from "./components/MediaContainer";
import { CommentsSection } from "./components/CommentsSection";
import { Badge } from "@/components/ui/badge";
import { FeedbackInput } from "@/app/review/[trackId]/feedbackInput";
import { Comment, detectAndExtractLinks } from "@/app/dashboard/components/libs";


interface ReviewPageProps {
  track: {
    id: string;
    projectId: string;
    roundNumber: number;
    clientDecision: "pending" | "approved" | "revisions_requested";
  };
  project: { id: string; title: string };
  deliverableLink: string;
  deliverableMediaType?: "video" | "image" | null;
  initialComments: Comment[];
  addCommentAction: (
    formData: FormData
  ) => Promise<{ message: string; comment: Comment }>;
  approveProjectAction: (projectId: string, trackId: string) => Promise<any>;
  requestRevisionsAction: (trackId: string) => Promise<any>;
  updateCommentAction: (
    formData: FormData
  ) => Promise<{ message: string; comment: Comment }>;
  deleteCommentAction: (commentId: string) => Promise<{ message: string }>;
  isAuthenticated?: boolean;
  userId?: string | null;
}


const MAX_IMAGES_PER_COMMENT = 4;
const ACCEPTED_IMAGE_TYPES_STRING = "image/jpeg,image/png,image/webp";


export default function ReviewPage({
  track,
  project,
  deliverableLink,
  deliverableMediaType,
  initialComments,
  addCommentAction,
  approveProjectAction,
  requestRevisionsAction,
  updateCommentAction,
  deleteCommentAction,
  isAuthenticated = false,
}: ReviewPageProps) {
  const router = useRouter();
  const [isAddPending, startAddTransition] = useTransition();
  const [isDecisionPending, startDecisionTransition] = useTransition();
  const [isEditDeletePending, startEditDeleteTransition] = useTransition();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [currentTime, setCurrentTime] = useState(0);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [commenterName, setCommenterName] = useState<string>("");

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentText, setEditedCommentText] = useState<string>("");
  const [editingExistingImageUrls, setEditingExistingImageUrls] = useState<
    string[]
  >([]);
  const [editingNewImageFiles, setEditingNewImageFiles] = useState<File[]>([]);
  const [editingNewImagePreviews, setEditingNewImagePreviews] = useState<
    string[]
  >([]);

  // Dialog control
  const [decisionDialogOpen, setDecisionDialogOpen] = useState(false);
  const [dialogStatus, setDialogStatus] = useState<{
    type: "pending" | "success" | "error";
    message?: string;
  }>({ type: "pending" });

  const isDecisionMade = track.clientDecision !== "pending";
  const isAnyActionPending =
    isAddPending || isDecisionPending || isEditDeletePending;
  const isVideoPlayerNeededByType = deliverableMediaType === "video";

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const [ownCommentIds, setOwnCommentIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      try {
        const savedIds = localStorage.getItem("ownCommentIds");
        if (savedIds) {
          setOwnCommentIds(JSON.parse(savedIds));
        }
      } catch (e) {
        console.error("Failed to parse saved comment IDs", e);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const previews = editingNewImageFiles.map((file) =>
      URL.createObjectURL(file)
    );
    setEditingNewImagePreviews(previews);
    return () => previews.forEach(URL.revokeObjectURL);
  }, [editingNewImageFiles]);

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file || imageFiles.length >= MAX_IMAGES_PER_COMMENT) {
        if (imageFiles.length >= MAX_IMAGES_PER_COMMENT) {
          toast({
            title: "Too many images",
            description: `Max ${MAX_IMAGES_PER_COMMENT} total.`,
            variant: "warning",
          });
        }
        return;
      }

      if (!ACCEPTED_IMAGE_TYPES_STRING.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Only JPG, PNG and WebP images are accepted.",
          variant: "warning",
        });
        return;
      }

      setImageFiles((prev) => [...prev, file]);
    },
    [imageFiles]
  );

  const handleEditComment = useCallback(
    (commentId: string) => {
      if (isDecisionMade || isAnyActionPending) return;

      // Find the comment to edit
      const commentToEdit = comments.find((c) => c.id === commentId);

      // Check if it's the user's own comment
      if (!commentToEdit || !commentToEdit.isOwnComment) {
        return; // Don't allow editing of comments that aren't the user's own
      }

      if (commentToEdit) {
        const plainText = commentToEdit.comment.text || "";
        const links = commentToEdit.comment.links || [];

        let displayText = plainText;
        links.forEach((link, index) => {
          displayText = displayText.replace(`[LINK:${index}]`, link.url);
        });

        setEditedCommentText(displayText);
        setEditingExistingImageUrls(commentToEdit.comment.images || []);
        setEditingNewImageFiles([]);
        setEditingNewImagePreviews([]);
        setEditingCommentId(commentId);
        setImageFiles([]);
      }
    },
    [comments, isDecisionMade, isAnyActionPending]
  );

  const handleCancelEdit = useCallback(() => {
    setEditingCommentId(null);
    setEditedCommentText("");
    setEditingExistingImageUrls([]);
    setEditingNewImageFiles([]);
    setEditingNewImagePreviews([]);
  }, []);

  const handleRemoveExistingImage = useCallback((indexToRemove: number) => {
    setEditingExistingImageUrls((prev) =>
      prev.filter((_, i) => i !== indexToRemove)
    );
  }, []);

  const handleRemoveNewImage = useCallback((indexToRemove: number) => {
    setEditingNewImageFiles((prev) =>
      prev.filter((_, i) => i !== indexToRemove)
    );
  }, []);

  const handleEditFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        const files = Array.from(event.target.files);
        const currentTotal =
          editingExistingImageUrls.length +
          editingNewImageFiles.length +
          files.length;
        const availableSlots =
          MAX_IMAGES_PER_COMMENT -
          (editingExistingImageUrls.length + editingNewImageFiles.length);

        if (currentTotal > MAX_IMAGES_PER_COMMENT) {
          toast({
            title: "Too many images",
            description: `You can add ${
              availableSlots > 0 ? `${availableSlots} more` : "no more"
            }. Max ${MAX_IMAGES_PER_COMMENT}.`,
            variant: "warning",
          });
          files.splice(availableSlots);
        }
        const validFiles = files.filter((file) => {
          if (!ACCEPTED_IMAGE_TYPES_STRING.includes(file.type)) {
            toast({
              title: "Invalid File Type",
              description: `"${file.name}" ignored.`,
              variant: "warning",
            });
            return false;
          }
          return true;
        });

        setEditingNewImageFiles((prev) => [...prev, ...validFiles]);
        if (event.target) event.target.value = "";
      }
    },
    [editingExistingImageUrls, editingNewImageFiles]
  );

  const handleSaveEdit = useCallback(async () => {
    if (!editingCommentId || isAnyActionPending || isDecisionMade) return;

    // Verify this is the user's own comment
    const commentToEdit = comments.find((c) => c.id === editingCommentId);
    if (!commentToEdit || !commentToEdit.isOwnComment) {
      toast({
        title: "Cannot Edit",
        description: "You can only edit your own comments",
        variant: "destructive",
      });
      return;
    }

    const totalImages =
      editingExistingImageUrls.length + editingNewImageFiles.length;
    if (!editedCommentText.trim() && totalImages === 0) {
      toast({
        title: "Cannot Save Empty Comment",
        description: "Please add text or an image.",
        variant: "warning",
      });
      return;
    }

    const formData = new FormData();
    formData.append("commentId", editingCommentId);
    formData.append("newCommentText", editedCommentText);
    formData.append("existingImages", JSON.stringify(editingExistingImageUrls));
    formData.append(
      "commenterName",
      commenterName.trim() || commentToEdit.commenter_display_name
    );

    editingNewImageFiles.forEach((file) => {
      formData.append("newImages", file);
    });

    startEditDeleteTransition(async () => {
      try {
        const result = await updateCommentAction(formData);
        setComments((prev) =>
          prev.map((c) => (c.id === editingCommentId ? result.comment : c))
        );
        handleCancelEdit();
        toast({
          title: "Success",
          description: result.message,
          variant: "success",
        });
      } catch (error: any) {
        toast({
          title: "Error Updating Comment",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  }, [
    editingCommentId,
    editedCommentText,
    editingExistingImageUrls,
    editingNewImageFiles,
    updateCommentAction,
    isAnyActionPending,
    isDecisionMade,
    handleCancelEdit,
    comments,
    commenterName,
  ]);

  const handleAIInputSubmit = useCallback(
    (value: string) => {
      if (
        editingCommentId ||
        isAnyActionPending ||
        isDecisionMade ||
        !value.trim()
      )
        return;

      const { processedText, links } = detectAndExtractLinks(value);
      const formData = new FormData();
      formData.append("trackId", track.id);
      formData.append("timestamp", currentTime.toString());
      formData.append("commentText", processedText.trim());

      // Add commenter name
      formData.append(
        "commenterName",
        commenterName.trim() || "Anonymous Visitor"
      );

      if (links.length > 0) {
        formData.append("links", JSON.stringify(links));
      }

      // Add any files that were selected
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      startAddTransition(async () => {
        try {
          const result = await addCommentAction(formData);

          // For anonymous users, save the comment ID in localStorage
          if (!isAuthenticated) {
            // Get existing comment IDs or initialize empty array
            let storedIds: string[] = [];
            try {
              const existingData = localStorage.getItem("ownCommentIds");
              storedIds = existingData ? JSON.parse(existingData) : [];
            } catch (e) {
              console.error("Error reading from localStorage:", e);
            }

            // Add new comment ID and save back to localStorage
            const updatedIds = [...storedIds, result.comment.id];
            localStorage.setItem("ownCommentIds", JSON.stringify(updatedIds));

            // Update state
            setOwnCommentIds(updatedIds);
          }

          // Add the comment to the state with isOwnComment flag set to true
          setComments((prev) => [
            ...prev,
            { ...result.comment, isOwnComment: true },
          ]);

          // Clear image files after submission
          setImageFiles([]);

          toast({ title: "Comment added", variant: "success" });
        } catch (error: any) {
          toast({
            title: "Error Adding Comment",
            description: error.message || "Failed to add comment",
            variant: "destructive",
          });
        }
      });
    },
    [
      track.id,
      currentTime,
      imageFiles,
      addCommentAction,
      isAnyActionPending,
      isDecisionMade,
      editingCommentId,
      commenterName,
      isAuthenticated,
    ]
  );

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      if (isAnyActionPending || isDecisionMade) return;

      // Verify this is the user's own comment
      let isOwnComment = false;

      if (isAuthenticated) {
        // For authenticated users, check the comment metadata
        const commentToDelete = comments.find((c) => c.id === commentId);
        isOwnComment = !!commentToDelete?.isOwnComment;
      } else {
        // For anonymous users, check localStorage
        try {
          const storedIds = localStorage.getItem("ownCommentIds");
          const ownIds = storedIds ? JSON.parse(storedIds) : [];
          isOwnComment = ownIds.includes(commentId);
        } catch (e) {
          console.error("Error reading from localStorage:", e);
        }
      }

      if (!isOwnComment) {
        toast({
          title: "Cannot Delete",
          description: "You can only delete your own comments",
          variant: "destructive",
        });
        return;
      }

      startEditDeleteTransition(async () => {
        try {
          const result = await deleteCommentAction(commentId);

          // For anonymous users, update localStorage
          if (!isAuthenticated) {
            try {
              const storedIds = localStorage.getItem("ownCommentIds");
              const ownIds = storedIds ? JSON.parse(storedIds) : [];
              const updatedIds = ownIds.filter(
                (id: string) => id !== commentId
              );
              localStorage.setItem("ownCommentIds", JSON.stringify(updatedIds));
              setOwnCommentIds(updatedIds);
            } catch (e) {
              console.error("Error updating localStorage:", e);
            }
          }

          // Remove the comment from the state
          setComments((prev) => prev.filter((c) => c.id !== commentId));

          // If we're editing this comment, cancel the edit
          if (editingCommentId === commentId) {
            handleCancelEdit();
          }

          toast({
            title: "Comment deleted",
            description: result.message || "Comment successfully deleted",
            variant: "success",
          });
        } catch (error: any) {
          toast({
            title: "Error Deleting",
            description: error.message || "Failed to delete comment",
            variant: "destructive",
          });
        }
      });
    },
    [
      deleteCommentAction,
      isAnyActionPending,
      isDecisionMade,
      editingCommentId,
      handleCancelEdit,
      comments,
      isAuthenticated,
    ]
  );

  const handleOpenDecisionDialog = () => {
    setDecisionDialogOpen(true);
    setDialogStatus({ type: "pending" });
  };

  const handleApprove = async () => {
    setDialogStatus({ type: "pending" });
    startDecisionTransition(async () => {
      try {
        await approveProjectAction(project.id, track.id);
        setDialogStatus({ type: "success", message: "Project Approved!" });
        setTimeout(() => {
          setDecisionDialogOpen(false);
          router.refresh();
        }, 1500);
      } catch (error: any) {
        setDialogStatus({ type: "error", message: error.message });
      }
    });
  };

  const handleRequestRevisions = async () => {
    setDialogStatus({ type: "pending" });
    startDecisionTransition(async () => {
      try {
        await requestRevisionsAction(track.id);
        setDialogStatus({ type: "success", message: "Revisions Requested" });
        setTimeout(() => {
          setDecisionDialogOpen(false);
          router.refresh();
        }, 1500);
      } catch (error: any) {
        setDialogStatus({ type: "error", message: error.message });
      }
    });
  };

  const canInteractWithAddForm =
    !isAnyActionPending && !isDecisionMade && !editingCommentId;

  const handleTimeChange = useCallback((newTime: number) => {
    setCurrentTime(newTime);
  }, []);

  // Anonymous commenter name input component
  const CommenterNameInput = () =>
    !isAuthenticated &&
    !isDecisionMade &&
    !editingCommentId && (
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Your Name (Optional)"
            value={commenterName}
            onChange={(e) => setCommenterName(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isAnyActionPending}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Leave your name so others know who left the comment
          </p>
        </div>
      </div>
    );

  return (
    <div className="w-full min-h-screen  mx-auto px-4 sm:px-6 pb-24">
      {/* Project Info Header */}
      <Card className="border-2 border-dashed mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-y-2">
            <div>
              <CardTitle className="text-xl md:text-2xl font-semibold">
                Review: {project.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground text-sm font-medium">
                  Round / Version {track.roundNumber}
                </p>
                <Link
                  href={`/review/${track.id}/history`}
                  className="text-xs text-primary hover:underline"
                >
                  View History
                </Link>
              </div>
            </div>
            <Badge
              variant={
                track.clientDecision === "approved"
                  ? "success"
                  : track.clientDecision === "revisions_requested"
                    ? "destructive"
                    : "warning"
              }
            >
              {track.clientDecision === "approved"
                ? "Approved"
                : track.clientDecision === "revisions_requested"
                  ? "Revisions Requested"
                  : "Awaiting Feedback"}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Main layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - Media + Input */}
        <div className="space-y-4">
          {/* Media Container */}
          <div>
            <MediaContainer
              deliverableLink={deliverableLink}
              deliverableMediaType={deliverableMediaType}
              projectTitle={project.title}
              roundNumber={track.roundNumber}
              setCurrentTime={setCurrentTime}
            />

            {isDecisionMade && (
              <div
                className={`mt-4 p-4 border-2 border-dashed rounded-md ${
                  track.clientDecision === "approved"
                    ? "bg-[#064E3B]/40 hover:bg-[#064E3B]/60 text-green-500"
                    : "bg-[#7F1D1D]/40 text-red-500 hover:bg-[#7F1D1D]/60"
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  {track.clientDecision === "approved" ? (
                    <ThumbsUp className="h-5 w-5" />
                  ) : (
                    <ShieldAlert className="h-5 w-5" />
                  )}
                  {track.clientDecision === "approved"
                    ? "Project Approved"
                    : "Revisions Requested"}
                </div>
                <p className="text-sm opacity-90 mt-1 pl-7">
                  {track.clientDecision === "approved"
                    ? "This project has been approved. No further action is needed."
                    : "The editor has been notified about the revision request."}
                </p>
              </div>
            )}
          </div>

          {/* Input directly under media */}
          {!isDecisionMade && !editingCommentId && (
            <div className="mt-4">
              <CommenterNameInput />
              <div>
                <FeedbackInput
                  placeholder="Add your feedback..."
                  onSubmit={handleAIInputSubmit}
                  onFileSelect={handleFileSelect}
                  onRemoveImage={(index) =>
                    setImageFiles((prev) => prev.filter((_, i) => i !== index))
                  }
                  disabled={!canInteractWithAddForm || isAddPending}
                  className="py-2"
                  minHeight={60}
                  maxHeight={120}
                  imageFiles={imageFiles}
                  currentTime={currentTime}
                  isVideoFile={isVideoPlayerNeededByType}
                  formatTime={formatTime}
                  maxImages={MAX_IMAGES_PER_COMMENT}
                  onTimeChange={handleTimeChange}
                  showDecisionButton={true}
                  onRequestRevisions={handleOpenDecisionDialog}
                  isDecisionPending={isDecisionPending}
                  decisionButtonDisabled={
                    isAnyActionPending || !!editingCommentId
                  }
                  projectTitle={project.title}
                  roundNumber={track.roundNumber}
                />
              </div>
            </div>
          )}

          {/* Comments section for mobile only */}
          <div className="lg:hidden mb-6 mt-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Feedback</h2>
              <span className="text-sm text-muted-foreground">
                {comments.length}{" "}
                {comments.length === 1 ? "comment" : "comments"}
              </span>
            </div>

            {comments.length > 0 ? (
              <CommentsSection
                comments={comments}
                isVideoFile={isVideoPlayerNeededByType}
                isAudioFile={false}
                isDecisionMade={isDecisionMade}
                editingCommentId={editingCommentId}
                editedCommentText={editedCommentText}
                onEdit={handleEditComment}
                onCancelEdit={handleCancelEdit}
                onSaveEdit={handleSaveEdit}
                onDelete={handleDeleteComment}
                onTextChange={setEditedCommentText}
                isEditDeletePending={isEditDeletePending}
                existingImageUrls={editingExistingImageUrls}
                newImageFiles={editingNewImageFiles}
                newImagePreviews={editingNewImagePreviews}
                onRemoveExistingImage={handleRemoveExistingImage}
                onRemoveNewImage={handleRemoveNewImage}
                onFileChange={handleEditFileChange}
                maxImages={MAX_IMAGES_PER_COMMENT}
                acceptedImageTypes={ACCEPTED_IMAGE_TYPES_STRING}
              />
            ) : (
              <Card className="text-center text-muted-foreground text-sm py-8">
                <CardContent className="py-0">
                  No feedback has been added yet.
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right column - Comments (Desktop only) */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Feedback</h2>
            <span className="text-sm text-muted-foreground">
              {comments.length} {comments.length === 1 ? "comment" : "comments"}
            </span>
          </div>

          {comments.length > 0 ? (
            <div className="pr-2">
              <CommentsSection
                comments={comments}
                isVideoFile={isVideoPlayerNeededByType}
                isAudioFile={false}
                isDecisionMade={isDecisionMade}
                editingCommentId={editingCommentId}
                editedCommentText={editedCommentText}
                onEdit={handleEditComment}
                onCancelEdit={handleCancelEdit}
                onSaveEdit={handleSaveEdit}
                onDelete={handleDeleteComment}
                onTextChange={setEditedCommentText}
                isEditDeletePending={isEditDeletePending}
                existingImageUrls={editingExistingImageUrls}
                newImageFiles={editingNewImageFiles}
                newImagePreviews={editingNewImagePreviews}
                onRemoveExistingImage={handleRemoveExistingImage}
                onRemoveNewImage={handleRemoveNewImage}
                onFileChange={handleEditFileChange}
                maxImages={MAX_IMAGES_PER_COMMENT}
                acceptedImageTypes={ACCEPTED_IMAGE_TYPES_STRING}
              />
            </div>
          ) : (
            <Card className="text-center text-muted-foreground text-sm py-8">
              <CardContent className="py-0">
                No feedback has been added yet.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Decision Dialog with feedback */}
      <Dialog open={decisionDialogOpen} onOpenChange={setDecisionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight text-transparent bg-clip-text dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)] bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.00)_202.08%)]">
              Submit Your Decision
            </DialogTitle>
            <DialogDescription>
              Round {track.roundNumber} - Once submitted, you cannot add or edit
              feedback
            </DialogDescription>
          </DialogHeader>

          {/* Dialog content based on status */}
          {dialogStatus.type === "pending" && (
            <div className="">
              <div className="grid grid-cols-2 gap-3">
                <RevButtons
                  variant="success"
                  onClick={handleApprove}
                  disabled={isDecisionPending}
                  className="w-full"
                >
                  {isDecisionPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Approve Project
                </RevButtons>
                <RevButtons
                  variant="destructive"
                  onClick={handleRequestRevisions}
                  disabled={isDecisionPending}
                  className="w-full"
                >
                  {isDecisionPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Edit className="h-4 w-4 mr-2" />
                  )}
                  Request Revisions
                </RevButtons>
              </div>
            </div>
          )}

          {dialogStatus.type === "success" && (
            <div className="py-6 text-center">
              <div className="mx-auto size-16 rounded-[10px] border-2 bg-[#064E3B]/40 flex items-center justify-center mb-4">
                <Check className="size-8 text-green-500" />
              </div>
              <div className="text-lg font-semibold text-green-600 mb-2">
                {dialogStatus.message}
              </div>
              <div className="text-sm text-muted-foreground">
                Redirecting in a moment...
              </div>
            </div>
          )}

          {dialogStatus.type === "error" && (
            <div className="py-6 text-center">
              <div className="mx-auto size-16 rounded-[10px] border-2 bg-[#7F1D1D]/40 flex items-center justify-center mb-4">
                <XCircle className="size-8 text-red-500" />
              </div>
              <div className="text-lg font-semibold text-red-600 mb-2">
                Error
              </div>
              <div className="text-sm text-muted-foreground">
                {dialogStatus.message}
              </div>
            </div>
          )}

          <DialogFooter>
            {(dialogStatus.type === "error" ||
              dialogStatus.type === "pending") && (
              <RevButtons
                variant="outline"
                className="w-full"
                onClick={() => setDecisionDialogOpen(false)}
                disabled={isDecisionPending}
              >
                Cancel
              </RevButtons>
            )}
          </DialogFooter>
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