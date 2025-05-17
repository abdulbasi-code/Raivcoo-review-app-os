// app/review/[trackId]/components/EditableReviewComment.tsx
"use client";

import React, { useRef } from "react";
import Image from "next/image"; // Import Next Image
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"; // Import Input
import { Label } from "@/components/ui/label"; // Import Label
import { RevButtons } from "@/components/ui/RevButtons";
import { Save, Ban, Loader2, Image as ImageIcon, XCircle } from "lucide-react"; // Import needed icons


interface EditableReviewCommentProps {
  editedText: string;
  existingImageUrls: string[]; // Images already saved with the comment
  newImageFiles: File[]; // New files staged during this edit
  newImagePreviews: string[]; // Previews for new files

  onTextChange: (newText: string) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;

  // Image Handlers
  onRemoveExistingImage: (index: number) => void;
  onRemoveNewImage: (index: number) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;

  // Constants
  maxImages: number;
  acceptedImageTypes: string;
}

export const EditableReviewComment: React.FC<EditableReviewCommentProps> = ({
  editedText,
  existingImageUrls,
  newImageFiles,
  newImagePreviews,
  onTextChange,
  onSave,
  onCancel,
  isSaving,
  onRemoveExistingImage,
  onRemoveNewImage,
  onFileChange,
  maxImages,
  acceptedImageTypes,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const totalImages = existingImageUrls.length + newImageFiles.length;
  const canAddMoreImages = totalImages < maxImages;

  return (
    <div className="mt-2 space-y-3">
      {/* Text Area (as before) */}
      <Textarea
        value={editedText}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Edit your feedback..."
        className="min-h-[80px] text-sm bg-background"
        disabled={isSaving}
        rows={4}
        aria-label="Edit comment text"
      />

      {/* Image Management Area */}
      <div className="space-y-2 pt-2">
        {/* Display Existing + New Images */}
        {(existingImageUrls.length > 0 || newImagePreviews.length > 0) && (
          <div className="flex flex-wrap gap-2 mt-2">
            {/* Existing Images */}
            {existingImageUrls.map((url, imgIndex) => (
              <div
                key={`existing-${url}-${imgIndex}`}
                className="relative w-20 h-20 group"
              >
                <Image
                  src={url}
                  alt={`Existing ${imgIndex + 1}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover rounded border"
                />
                <RevButtons
                  variant="destructive"
                  size="icon"
                  className="absolute top-0 right-0 h-5 w-5 rounded-full -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemoveExistingImage(imgIndex)}
                  title="Remove image"
                  disabled={isSaving}
                >
                  <XCircle className="h-4 w-4" />
                </RevButtons>
              </div>
            ))}
            {/* New Image Previews */}
            {newImagePreviews.map((previewUrl, fileIndex) => (
              <div
                key={`new-preview-${fileIndex}`}
                className="relative w-20 h-20 group"
              >
                <Image
                  src={previewUrl}
                  alt={`New preview ${fileIndex + 1}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover rounded border"
                />
                <RevButtons
                  variant="destructive"
                  size="icon"
                  className="absolute top-0 right-0 h-5 w-5 rounded-full -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemoveNewImage(fileIndex)}
                  title="Remove image"
                  disabled={isSaving}
                >
                  <XCircle className="h-4 w-4" />
                </RevButtons>
              </div>
            ))}
          </div>
        )}

        {/* Add Image Input */}
        <Label
          htmlFor="edit-image-upload"
          className={`text-sm font-medium flex items-center gap-2 ${canAddMoreImages ? "text-muted-foreground cursor-pointer hover:text-primary" : "text-muted-foreground/50 cursor-not-allowed"}`}
        >
          <ImageIcon className="h-4 w-4" /> Add/Change Images ({totalImages}/
          {maxImages})
        </Label>
        <Input
          id="edit-image-upload"
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedImageTypes}
          onChange={onFileChange}
          className="hidden"
          disabled={!canAddMoreImages || isSaving}
        />
        {!canAddMoreImages && totalImages > 0 && (
          <p className="text-xs text-muted-foreground">
            Maximum number of images reached.
          </p>
        )}
      </div>

      {/* Action Buttons (as before) */}
      <div className="flex justify-end gap-2 pt-2">
        <RevButtons
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSaving}
          aria-label="Cancel edit"
        >
          <Ban className="h-4 w-4 mr-1" /> Cancel
        </RevButtons>
        <RevButtons
          variant="success"
          size="sm"
          onClick={onSave}
          disabled={isSaving || (!editedText.trim() && totalImages === 0)}
          aria-label="Save changes"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-1" />
          )}
          Save
        </RevButtons>
      </div>
      {!editedText.trim() && totalImages === 0 && (
        <p className="text-xs text-destructive text-right">
          Cannot save an empty comment (no text and no images).
        </p>
      )}
    </div>
  );
};
