// app/review/[trackId]/components/CommentsSection.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { formatTime } from "@/app/review/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Pencil, Trash2, Clock, ExternalLink } from "lucide-react";
import { CommentTextWithLinks } from "./CommentTextWithLinks";
import { EditableReviewComment } from "./EditableReviewComment";
import { RevButtons } from "@/components/ui/RevButtons";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Comment, formatFullDate } from "@/app/dashboard/components/libs";



// Interface for the props received by this component
interface CommentsSectionProps {
  comments: Comment[];
  isVideoFile: boolean;
  isAudioFile: boolean;
  isDecisionMade: boolean;

  // Edit State & Handlers (Text)
  editingCommentId: string | null;
  editedCommentText: string;
  onEdit: (commentId: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => Promise<void>;
  onDelete: (commentId: string) => void;
  onTextChange: (newText: string) => void;
  isEditDeletePending: boolean;

  // **NEW**: Edit State & Handlers (Images) - Passed down from ReviewPage
  existingImageUrls: string[];
  newImageFiles: File[];
  newImagePreviews: string[];
  onRemoveExistingImage: (index: number) => void;
  onRemoveNewImage: (index: number) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  maxImages: number;
  acceptedImageTypes: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments,
  isVideoFile,
  isAudioFile,
  isDecisionMade,
  // Text Edit Props
  editingCommentId,
  editedCommentText,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onTextChange,
  isEditDeletePending,
  // **NEW**: Image Edit Props
  existingImageUrls,
  newImageFiles,
  newImagePreviews,
  onRemoveExistingImage,
  onRemoveNewImage,
  onFileChange,
  maxImages,
  acceptedImageTypes,
}) => {
  const isEditingThisComment = (commentId: string) =>
    editingCommentId === commentId;

  // State for image dialog
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const [currentImageAlt, setCurrentImageAlt] = useState<string>("");

  // Open image dialog
  const openImageDialog = (imageUrl: string, commentIndex: number) => {
    setCurrentImageUrl(imageUrl);
    setCurrentImageAlt(`Comment image ${commentIndex + 1}`);
    setImageDialogOpen(true);
  };

  return (
    <Card className="border-0 p-0 m-0">
      <CardHeader className="p-0 m-0"></CardHeader>
      <CardContent className="p-0 m-0">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            No feedback comments yet.
          </p>
        ) : (
          <div className="space-y-4 max-h-[60vh]  pr-3 -mr-3">
            {comments.map((comment) => {
              const canModify = comment.isOwnComment && !isDecisionMade;
              const isCurrentlyEditing = isEditingThisComment(comment.id);

              return (
                <div
                  key={comment.id}
                  className={`p-3 rounded-md border-2 border-dashed transition-colors duration-200 `}
                >
                  {/* Comment Header: Info and Edit/Delete Buttons */}
                  <div className="flex justify-between items-start gap-2 flex-wrap mb-2">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1 flex-wrap">
                        <Avatar className="size-5 border-2 border-dashed">
                          <AvatarImage src={`https://avatar.vercel.sh/%50`} />
                          <AvatarFallback>
                            {comment.commenter_display_name
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-semibold text-sm">
                          {comment.commenter_display_name}
                        </p>
                        {(isVideoFile || isAudioFile) && (
                          <p className="text-xs ml-2 text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> At{" "}
                            {formatTime(comment.comment.timestamp)}
                          </p>
                        )}
                      </div>
                      <span
                        className="text-xs text-muted-foreground flex-shrink-0"
                        title={new Date(comment.created_at).toString()}
                      >
                        {formatFullDate(comment.created_at)}
                      </span>
                    </div>
                    {canModify && !isCurrentlyEditing && (
                      <div className="flex items-center gap-1">
                        <RevButtons
                          variant="info"
                          size="icon"
                          className="size-8"
                          onClick={() => onEdit(comment.id)}
                          title="Edit comment"
                          disabled={isEditDeletePending || !!editingCommentId}
                        >
                          <Pencil className="h-4 w-4" />
                        </RevButtons>
                        <RevButtons
                          variant="destructive"
                          size="icon"
                          className="size-8"
                          onClick={() => onDelete(comment.id)}
                          title="Delete comment"
                          disabled={isEditDeletePending || !!editingCommentId}
                        >
                          <Trash2 className="h-4 w-4" />
                        </RevButtons>
                      </div>
                    )}
                  </div>

                  {/* Comment Body: Editable or Display */}
                  {isCurrentlyEditing ? (
                    <EditableReviewComment
                      // Text Props
                      editedText={editedCommentText}
                      onTextChange={onTextChange}
                      onSave={onSaveEdit}
                      onCancel={onCancelEdit}
                      isSaving={isEditDeletePending}
                      // **NEW**: Image Props Passed Down
                      existingImageUrls={existingImageUrls}
                      newImageFiles={newImageFiles}
                      newImagePreviews={newImagePreviews}
                      onRemoveExistingImage={onRemoveExistingImage}
                      onRemoveNewImage={onRemoveNewImage}
                      onFileChange={onFileChange}
                      maxImages={maxImages}
                      acceptedImageTypes={acceptedImageTypes}
                    />
                  ) : (
                    <>
                      {/* Display Text */}
                      {(comment.comment.text ||
                        (comment.comment.links &&
                          comment.comment.links.length > 0)) && (
                        <div className="mt-1 text-sm">
                          <CommentTextWithLinks
                            text={comment.comment.text}
                            links={comment.comment.links}
                          />
                        </div>
                      )}
                      {/* Display Images */}
                      {comment.comment.images &&
                        comment.comment.images.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {comment.comment.images.map((imageUrl, idx) => (
                              <div
                                key={`${imageUrl}-${idx}`}
                                className="inline-block"
                                onClick={() => openImageDialog(imageUrl, idx)}
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
                      {/* Display if comment is truly empty */}
                      {!comment.comment.text &&
                        (!comment.comment.images ||
                          comment.comment.images.length === 0) &&
                        (!comment.comment.links ||
                          comment.comment.links.length === 0) && (
                          <p className="text-sm text-muted-foreground italic mt-1">
                            (Comment is empty)
                          </p>
                        )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Image Dialog */}
        <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
          <DialogContent className="max-w-6xl w-[95vw] p-4 max-h-[95vh]">
            <DialogHeader className="flex flex-row justify-between items-center p-2"></DialogHeader>
            <div className="overflow-auto flex justify-center items-center bg-black border-2 border-dashed rounded-md max-h-[calc(95vh-100px)]">
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
      </CardContent>
    </Card>
  );
};