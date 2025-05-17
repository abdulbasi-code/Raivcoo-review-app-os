// app/dashboard/projects/[id]/components/StepContentEditor.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RevButtons } from "@/components/ui/RevButtons";
import { toast } from "@/hooks/use-toast";
import {
  Loader2,
  XCircle,
  Image as ImageIcon,
  Link2,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { Label } from "@/components/ui/label";

interface LinkData {
  url: string;
  text: string;
}

interface StepMetadata {
  links?: LinkData[];
  images?: string[];
  full_text?: string;
  created_at?: string;
  original_comment_id?: string;
}

interface Step {
  name: string;
  status: "pending" | "completed";
  deliverable_link?: string | null;
  metadata?: StepMetadata;
}

interface StepContentEditorProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trackId: string;
  stepIndex: number;
  step: Step;
  updateStepContentAction: (formData: FormData) => Promise<any>;
  onSaveSuccess: () => void;
}

const MAX_IMAGES_PER_COMMENT = 4;
const ACCEPTED_IMAGE_TYPES_STRING = "image/jpeg,image/png,image/webp";

const detectAndExtractLinks = (
  text: string
): { processedText: string; links: LinkData[] } => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const links: LinkData[] = [];
  let processedText = text;
  let match;
  let linkIndex = 0;

  const tempPlaceholder = (index: number) => `__TEMP_LINK_${index}__`;

  while ((match = urlRegex.exec(processedText)) !== null) {
    const precedingChar = processedText[match.index - 1];
    const followingChar = processedText[match.index + match[0].length];
    if (
      precedingChar === '"' ||
      precedingChar === "'" ||
      precedingChar === ">" ||
      followingChar === "<"
    ) {
      continue;
    }

    const url = match[0];
    links.push({ url: url, text: url });
    processedText = processedText.replace(url, tempPlaceholder(linkIndex));
    linkIndex++;

    urlRegex.lastIndex = 0;
  }

  links.forEach((_, index) => {
    processedText = processedText.replace(
      tempPlaceholder(index),
      `[LINK:${index}]`
    );
  });

  return { processedText, links };
};

export function StepContentEditor({
  isOpen,
  onOpenChange,
  trackId,
  stepIndex,
  step,
  updateStepContentAction,
  onSaveSuccess,
}: StepContentEditorProps) {
  const [editText, setEditText] = useState("");
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && step?.metadata) {
      setEditText(step.metadata.full_text || "");
      setExistingImageUrls(step.metadata.images || []);

      setNewImageFiles([]);
      setImagePreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }

    setIsSaving(false);
  }, [isOpen, step]);

  useEffect(() => {
    const newPreviews = newImageFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(newPreviews);

    return () => newPreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [newImageFiles]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const totalImages =
        existingImageUrls.length + newImageFiles.length + files.length;

      if (totalImages > MAX_IMAGES_PER_COMMENT) {
        toast({
          title: "Too many images",
          description: `You can only have up to ${MAX_IMAGES_PER_COMMENT} images in total (including existing and new).`,
          variant: "warning",
        });

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      setNewImageFiles((prevFiles) => [...prevFiles, ...files]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeExistingImage = (indexToRemove: number) => {
    setExistingImageUrls((prevUrls) =>
      prevUrls.filter((_, index) => index !== indexToRemove)
    );
  };

  const removeNewImage = (indexToRemove: number) => {
    setNewImageFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { processedText, links } = detectAndExtractLinks(editText);
    const formData = new FormData();
    formData.append("trackId", trackId);
    formData.append("stepIndex", stepIndex.toString());
    formData.append("text", processedText.trim());
    formData.append("links", JSON.stringify(links));
    formData.append("existingImages", JSON.stringify(existingImageUrls));

    newImageFiles.forEach((file) => {
      formData.append("newImages", file);
    });

    try {
      const result = await updateStepContentAction(formData);
      toast({
        title: "Success",
        description: result?.message || "Step content updated successfully!",
        variant: "success",
      });
      onSaveSuccess();
    } catch (error: any) {
      console.error("Error saving step content:", error);
      toast({
        title: "Error Updating Step",
        description: error.message || "Failed to save changes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const currentTotalImages = existingImageUrls.length + newImageFiles.length;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Step Content</DialogTitle>
          <DialogDescription>
            Modify the details for step: "{step.name}". Changes will be
            reflected in the workflow.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4 overflow-y-auto flex-grow pr-2">
          <div>
            <Label htmlFor="step-text-area" className="mb-1 block">
              Description / Feedback
            </Label>
            <Textarea
              id="step-text-area"
              placeholder="Enter description or feedback details..."
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-[120px]"
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Link2 className="h-3 w-3" /> URLs pasted here will be
              automatically converted to clickable links on save.
            </p>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Attached Images (
              {currentTotalImages} / {MAX_IMAGES_PER_COMMENT})
            </Label>

            {existingImageUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 border p-2 rounded bg-muted/30">
                {existingImageUrls.map((imageUrl, index) => (
                  <div
                    key={`existing-${index}-${imageUrl}`}
                    className="relative w-20 h-20 group"
                  >
                    <a
                      href={imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full h-full rounded border overflow-hidden"
                    >
                      <Image
                        src={imageUrl}
                        alt={`Existing image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </a>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-0 h-5 w-5 rounded-full -mt-1 -mr-1 z-10 opacity-70 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeExistingImage(index)}
                      disabled={isSaving}
                      title="Remove existing image"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 border p-2 rounded bg-blue-50">
                {imagePreviews.map((previewUrl, index) => (
                  <div
                    key={`new-${index}`}
                    className="relative w-20 h-20 group"
                  >
                    <Image
                      src={previewUrl}
                      alt={`New preview ${index + 1}`}
                      fill
                      className="object-cover rounded border"
                      sizes="80px"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-0 h-5 w-5 rounded-full -mt-1 -mr-1 z-10 opacity-70 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeNewImage(index)}
                      disabled={isSaving}
                      title="Remove new image"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {currentTotalImages < MAX_IMAGES_PER_COMMENT && (
              <div>
                <Label
                  htmlFor="step-image-upload"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer inline-flex items-center gap-1"
                >
                  <ImageIcon className="h-4 w-4" /> Add More Images...
                </Label>
                <Input
                  id="step-image-upload"
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ACCEPTED_IMAGE_TYPES_STRING}
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={
                    isSaving || currentTotalImages >= MAX_IMAGES_PER_COMMENT
                  }
                />
              </div>
            )}
            {currentTotalImages >= MAX_IMAGES_PER_COMMENT && (
              <p className="text-xs text-muted-foreground">
                Maximum number of images reached.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="mt-auto pt-4 border-t">
          <DialogClose asChild>
            <RevButtons variant="outline" disabled={isSaving}>
              {" "}
              Cancel{" "}
            </RevButtons>
          </DialogClose>
          <RevButtons
            variant="success"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
            Changes
          </RevButtons>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
