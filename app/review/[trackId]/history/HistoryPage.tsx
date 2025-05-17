// app/review/[trackId]/history/HistoryPage.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RevButtons } from "@/components/ui/RevButtons";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CommentsSection } from "../components/CommentsSection";
import { Comment, Project } from "@/app/dashboard/components/libs";

interface Track {
  id: string;
  project_id: string;
  round_number: number;
  client_decision: "pending" | "approved" | "revisions_requested";
  created_at: string;
  updated_at: string;
}

interface CurrentTrack extends Track {
  project: Project;
  steps: any[];
}

interface HistoryPageProps {
  currentTrack: CurrentTrack;
  allTracks: Track[];
  commentsByTrack: Record<string, Comment[]>;
  clientName: string;
  projectTitle: string;
}

export default function HistoryPage({
  currentTrack,
  allTracks,
  commentsByTrack,
  projectTitle,
}: HistoryPageProps) {
  const [selectedTrackId, setSelectedTrackId] = useState<string>(
    currentTrack.id
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Approved
          </Badge>
        );
      case "revisions_requested":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Needs Revision
          </Badge>
        );
      default:
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Pending
          </Badge>
        );
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return "Unknown date";
    }
  };

  const selectedTrack = allTracks.find((track) => track.id === selectedTrackId);
  const selectedComments = commentsByTrack[selectedTrackId] || [];

  return (
    <div className="xl:container  mx-auto py-6 px-4">
      <div className="flex items-center mb-6">
        <Link href={`/review/${currentTrack.id}`} className="mr-4">
          <RevButtons variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Review
          </RevButtons>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{projectTitle}</h1>
          <p className="text-muted-foreground">Review History</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Track history sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Review Rounds</CardTitle>
              <CardDescription>View feedback from all rounds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {allTracks.map((track) => (
                <div key={track.id} className="space-y-2">
                  <div className="flex justify-between">
                    <span>{""}</span>
                    {getStatusBadge(track.client_decision)}
                  </div>
                  <button
                    onClick={() => setSelectedTrackId(track.id)}
                    className={`w-full text-left p-3 border-2 border-dashed rounded-lg transition-colors ${
                      selectedTrackId === track.id
                        ? "bg-primary/10 border-primary/30"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">
                        Round {track.round_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(track.updated_at || track.created_at)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {commentsByTrack[track.id]?.length || 0} comments
                    </div>
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Track details */}
        <div className="md:col-span-3">
          <Card className="overflow-y-scroll">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>
                    Round {selectedTrack?.round_number} Feedback
                  </CardTitle>
                  <CardDescription>
                    Client feedback and comments for this round
                  </CardDescription>
                </div>
                {selectedTrack && getStatusBadge(selectedTrack.client_decision)}
              </div>
            </CardHeader>
            <CardContent>
              {selectedComments.length > 0 ? (
                <CommentsSection
                  comments={selectedComments}
                  isVideoFile={false}
                  isAudioFile={false}
                  isDecisionMade={true}
                  editingCommentId={null}
                  editedCommentText=""
                  onEdit={() => {}}
                  onCancelEdit={() => {}}
                  onSaveEdit={async () => {}}
                  onDelete={() => {}}
                  onTextChange={() => {}}
                  isEditDeletePending={false}
                  existingImageUrls={[]}
                  newImageFiles={[]}
                  newImagePreviews={[]}
                  onRemoveExistingImage={() => {}}
                  onRemoveNewImage={() => {}}
                  onFileChange={() => {}}
                  maxImages={4}
                  acceptedImageTypes="image/jpeg,image/png,image/webp"
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No feedback has been provided for this round yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}