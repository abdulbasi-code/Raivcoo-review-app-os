// ProjectComments.tsx
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { CommentTextWithLinks } from "@/app/dashboard/projects/[id]/CommentRenderer";
import { Clock, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatTime } from "@/app/review/lib/utils";
import { Comment } from "@/app/dashboard/components/libs";

interface ProjectCommentsProps {
  comments: Comment[];
  formatFullDate: (dateString: string | undefined | null) => string;
  openImageDialog: (imageUrl: string, altText: string) => void;
}

export function ProjectComments({
  comments,
  formatFullDate,
  openImageDialog,
}: ProjectCommentsProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment.id} className="p-4  rounded-md bg-muted/5">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-start gap-1 mb-2">
              <Avatar className="size-5 border-2 border-dashed">
                <AvatarImage src={`https://avatar.vercel.sh/%50`} />
                <AvatarFallback>C</AvatarFallback>
              </Avatar>{" "}
              <span className="text-sm font-medium flex items-center gap-1">
                Client{" "}
                <p className="text-xs ml-2 text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> At{" "}
                  {formatTime(comment.comment.timestamp)}
                </p>
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatFullDate(comment.created_at)}
            </span>
          </div>
          <div className="p-3 border-2 border-dashed rounded-md text-sm">
            <CommentTextWithLinks
              text={comment.comment.text}
              links={comment.comment.links}
            />
          </div>
          {comment.comment.images && comment.comment.images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {comment.comment.images.map((imageUrl, idx) => (
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
        </Card>
      ))}
    </div>
  );
}
