// components/dashboard/projects/StepCommentsSection.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CommentTextWithLinks } from "./CommentRenderer";
import { ExternalLink } from "lucide-react";
import { Step } from "./TrackManager";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

interface StepCommentsSectionProps {
  step: Step;
  isFinalStep?: boolean;
}

export function StepCommentsSection({
  step,
  isFinalStep,
}: StepCommentsSectionProps) {
  const metadata = step.metadata;

  // State for image dialog
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const [currentImageAlt, setCurrentImageAlt] = useState<string>("");

  // Open image dialog
  const openImageDialog = (imageUrl: string, altText: string) => {
    setCurrentImageUrl(imageUrl);
    setCurrentImageAlt(altText);
    setImageDialogOpen(true);
  };

  return (
    <div className="flex-1 w-full">
      <span
        className={`font-medium text-sm sm:text-base truncate ${step.status === "completed" ? "line-through text-muted-foreground" : ""}`}
        title={metadata?.text || ""}
      >
        {metadata?.text ? null : (
          <>
            <TextShimmer className="text-sm" duration={2}>
              {isFinalStep
                ? "Final Deliverable Step - Waiting for other steps"
                : "No description"}
            </TextShimmer>
          </>
        )}
      </span>

      {metadata?.text && (
        <div>
          <CommentTextWithLinks text={metadata.text} links={metadata.links} />
        </div>
      )}

      {metadata?.images && metadata.images.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {metadata.images.map((imageUrl, idx) => (
            <div
              key={`${imageUrl}-${idx}`}
              className="inline-block"
              onClick={() =>
                openImageDialog(imageUrl, `Reference image ${idx + 1}`)
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

      {isFinalStep && step.status === "completed" && step.deliverable_link && (
        <div className="mt-2">
          <Link
            href={step.deliverable_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:underline text-sm bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            View Submitted Deliverable
          </Link>
        </div>
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
    </div>
  );
}