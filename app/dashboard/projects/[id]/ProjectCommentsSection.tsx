// components/ProjectCommentsSection.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { CommentTextWithLinks } from "./CommentRenderer";
import { formatTime } from "@/app/review/lib/utils";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatFullDate } from "../../components/libs";

interface Comment {
  id: string;
  created_at: string;
  comment: {
    text: string;
    timestamp: number;
    images?: string[];
    links?: { url: string; text: string }[];
  };
  commenter_display_name: string;
}

interface ProjectCommentsSectionProps {
  comments: Comment[];
}

export const ProjectCommentsSection: React.FC<ProjectCommentsSectionProps> = ({
  comments,
}) => {
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

  return (
    <Card className="border-none p-0 m-0 bg-transparent">
      <CardContent className="p-0 m-0">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-base">
            No feedback comments yet.
          </p>
        ) : (
          <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 rounded-lg border-[2px] border-dashed hover:border-muted-foreground/40 transition-colors"
              >
                <div className="flex justify-between items-start gap-3 flex-wrap mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8 border-2 border-dashed">
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${comment.commenter_display_name}`}
                      />
                      <AvatarFallback className="text-sm font-medium">
                        {comment.commenter_display_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <p className="font-medium text-base">
                        {comment.commenter_display_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        at {formatTime(comment.comment.timestamp)}
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-sm text-muted-foreground flex-shrink-0"
                    title={new Date(comment.created_at).toString()}
                  >
                    {formatFullDate(comment.created_at)}
                  </span>
                </div>
                {comment.comment.text && (
                  <div className="mt-3 text-base leading-relaxed whitespace-pre-wrap pl-11">
                    <CommentTextWithLinks
                      text={comment.comment.text}
                      links={comment.comment.links}
                    />
                  </div>
                )}
                {comment.comment.images &&
                  comment.comment.images.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-3 pl-11">
                      {comment.comment.images.map((imageUrl, idx) => (
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
                          <div className="relative rounded-lg overflow-hidden border-2 border-muted hover:border-primary transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                            <Image
                              src={imageUrl}
                              alt={`Reference image ${idx + 1}`}
                              height={180}
                              width={0}
                              className="max-h-[180px] w-auto group-hover:opacity-90 transition-opacity"
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
            ))}
          </div>
        )}
      </CardContent>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-7xl w-[95vw] p-6 max-h-[95vh]">
          <DialogHeader className="flex flex-row justify-between items-center p-2"></DialogHeader>
          <div className="overflow-auto flex justify-center items-center bg-black border-2 border-muted rounded-lg max-h-[calc(95vh-120px)]">
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
    </Card>
  );
};