"use client";

import React, { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, Image as ImageIcon, XCircle, Save } from "lucide-react";
import { Step } from "./TrackManager";
import Image from "next/image";
import { RevButtons } from "@/components/ui/RevButtons";

const MAX_IMAGES_PER_COMMENT = 4;
const ACCEPTED_IMAGE_TYPES_STRING = "image/jpeg,image/png,image/webp";

interface EditableCommentProps {
  trackId: string;
  step: Step;
  index: number;
  onSave: (formData: FormData) => Promise<void>;
  onCancel?: () => void;
}

function renderPlainTextWithUrls(
  rawText: string | undefined,
  links: { url: string; text: string }[] | undefined
): string {
  if (!rawText) return "";
  if (!links || links.length === 0) {
    return rawText;
  }
  let renderedText = rawText;
  renderedText = renderedText.replace(/\[LINK:(\d+)\]/g, (match, indexStr) => {
    const index = parseInt(indexStr, 10);
    if (links[index] && links[index].url) {
      return links[index].url;
    }
    return match;
  });
  return renderedText;
}

export function EditableComment({
  trackId,
  step,
  index,
  onSave,
}: EditableCommentProps) {
  const [editedText, setEditedText] = useState(() =>
    renderPlainTextWithUrls(step.metadata?.text, step.metadata?.links)
  );
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(
    step.metadata?.images || []
  );
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setEditedText(
      renderPlainTextWithUrls(step.metadata?.text, step.metadata?.links)
    );
    setExistingImageUrls(step.metadata?.images || []);
    setNewImageFiles([]);
  }, [step]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const currentTotal = existingImageUrls.length + newImageFiles.length;
      const availableSlots = MAX_IMAGES_PER_COMMENT - currentTotal;

      if (files.length > availableSlots) {
        toast({
          title: "Too many images selected",
          description: `You can add ${availableSlots > 0 ? `up to ${availableSlots} more` : "no more"} image(s). Max ${MAX_IMAGES_PER_COMMENT} total.`,
          variant: "warning",
        });
        files.splice(availableSlots);
      }

      const validFiles = files.filter((file) => {
        if (!ACCEPTED_IMAGE_TYPES_STRING.split(",").includes(file.type)) {
          toast({
            title: "Invalid File Type",
            description: `File "${file.name}" has an unsupported type. Only JPG, PNG, WebP allowed.`,
            variant: "warning",
          });
          return false;
        }

        return true;
      });

      setNewImageFiles((prev) => [...prev, ...validFiles]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeExistingImage = (imgIndex: number) => {
    setExistingImageUrls((prev) => prev.filter((_, i) => i !== imgIndex));
  };

  const removeNewImage = (fileIndex: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
  };

  const handleSave = async () => {
    if (
      !editedText.trim() &&
      existingImageUrls.length === 0 &&
      newImageFiles.length === 0
    ) {
      toast({
        title: "Cannot Save Empty Step",
        description: "Please add text or an image to the step.",
        variant: "warning",
      });
      return;
    }

    setIsSaving(true);
    const formData = new FormData();
    formData.append("trackId", trackId);
    formData.append("stepIndex", index.toString());
    formData.append("text", editedText.trim()); // Sends text with URLs as strings
    formData.append("existingImages", JSON.stringify(existingImageUrls));
    newImageFiles.forEach((file, i) => {
      formData.append("newImages", file, file.name);
    });

    try {
      await onSave(formData);

      setNewImageFiles([]);
    } catch (error) {
      console.error("Save failed in EditableComment:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const totalImages = existingImageUrls.length + newImageFiles.length;
  const canAddMoreImages = totalImages < MAX_IMAGES_PER_COMMENT;

  return (
    <div className=" rounded-lg p-4 space-y-3 border-2   relative">
      <RevButtons
        type="button"
        variant="outline"
        size="sm"
        onClick={handleSave}
        disabled={isSaving}
        className="absolute top-2 right-2 flex items-center gap-1"
        title="Save Changes for this Step"
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">Save</span>
      </RevButtons>

      <Textarea
        value={editedText}
        onChange={(e) => setEditedText(e.target.value)}
        placeholder="Describe this work step..."
        className="min-h-[80px] mt-8"
        disabled={isSaving}
      />

      <div className="space-y-2 pt-2">
        <Label
          htmlFor={`image-upload-${index}`}
          className={`text-sm font-medium flex items-center gap-2 ${
            canAddMoreImages
              ? "text-muted-foreground cursor-pointer hover:text-primary"
              : "text-muted-foreground/50 cursor-not-allowed"
          }`}
        >
          <ImageIcon className="h-4 w-4" /> Add Reference Images ({totalImages}/
          {MAX_IMAGES_PER_COMMENT})
        </Label>
        <Input
          id={`image-upload-${index}`}
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_IMAGE_TYPES_STRING}
          onChange={handleFileChange}
          className="hidden"
          disabled={!canAddMoreImages || isSaving}
        />

        {(existingImageUrls.length > 0 || newImageFiles.length > 0) && (
          <div className="flex flex-wrap gap-2 mt-2">
            {/* Existing Images */}
            {existingImageUrls.map((url, imgIndex) => (
              <div
                key={`existing-${url}-${imgIndex}`}
                className="relative w-20 h-20 group"
              >
                <Image
                  src={url}
                  alt={`Existing image ${imgIndex + 1}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover rounded border"
                />
                <RevButtons
                  variant="destructive"
                  size="icon"
                  className="absolute top-0 right-0 h-5 w-5 rounded-full -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeExistingImage(imgIndex)}
                  title="Remove image"
                  disabled={isSaving}
                >
                  <XCircle className="h-4 w-4" />
                </RevButtons>
              </div>
            ))}
            {/* New Image Previews */}
            {newImageFiles.map((file, fileIndex) => (
              <div
                key={`new-${file.name}-${fileIndex}`}
                className="relative w-20 h-20 group"
              >
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${file.name}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover rounded border"
                  onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                />
                <RevButtons
                  variant="destructive"
                  size="icon"
                  className="absolute top-0 right-0 h-5 w-5 rounded-full -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeNewImage(fileIndex)}
                  title="Remove image"
                  disabled={isSaving}
                >
                  <XCircle className="h-4 w-4" />
                </RevButtons>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
