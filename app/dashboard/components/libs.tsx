// Helper functions
import {
  AlertCircle,
  CheckCircle2,
  CircleDot,
  PauseCircle,
  XCircle,
} from "lucide-react";

export function getStatusDescription(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
      return "This project has been marked as complete.";
    case "active":
      return "The project is currently active and being worked on.";
    case "in_progress":
      return "The project is in progress and partially completed.";
    case "on_hold":
      return "Work on this project is temporarily paused.";
    case "cancelled":
      return "This project has been cancelled.";
    default:
      return "Unknown status.";
  }
}
export function getStatusDotColor(status: string) {
  switch (status?.toLowerCase()) {
    case "completed":
      return "bg-green-500";
    case "active":
      return "bg-blue-500";
    case "in_progress":
    case "on_hold":
      return "bg-yellow-500";
    case "cancelled":
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
}

export function getStatusVariant(
  status: string | undefined | null
):
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "info" {
  switch (status?.toLowerCase()) {
    case "completed":
      return "success";
    case "active":
      return "info";
    case "in_progress":
      return "warning";
    case "on_hold":
      return "warning";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
}

export function formatStatus(status: string): string {
  if (!status) return "Unknown";
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export const formatFullDate = (
  dateString: string | undefined | null
): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);

  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch (error) {
    return `${date.toDateString()} ${date.toTimeString().substring(0, 5)}`;
  }
};
export function isDeadlineApproaching(
  deadline: string | undefined | null
): boolean {
  if (!deadline) return false;
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffDays = Math.ceil(
    (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diffDays <= 3;
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getStatusIcon(status: string | undefined) {
  switch (status?.toLowerCase()) {
    case "completed":
      return <CheckCircle2 className="h-3 w-3" />;
    case "active":
    case "in_progress":
      return <CircleDot className="h-3 w-3" />;
    case "on_hold":
      return <PauseCircle className="h-3 w-3" />;
    case "cancelled":
      return <XCircle className="h-3 w-3" />;
    default:
      return <AlertCircle className="h-3 w-3" />;
  }
}
export function renderPlainTextWithUrls(
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
    if (links && links[index] && links[index].url) {
      return links[index].url;
    }
    return match;
  });
  return renderedText;
}
export function detectAndExtractLinks(text: string) {
  const urlRegex = /(https?:\/\/[^\s<>"]+)/g;
  const links: { url: string; text: string }[] = [];
  let processedText = text;
  const urlMatches = Array.from(text.matchAll(urlRegex));

  urlMatches.forEach((match) => {
    const url = match[0];
    if (text.substring(match.index! - 6, match.index!) === "[LINK:") return;
    let existingLinkIndex = links.findIndex((link) => link.url === url);
    if (existingLinkIndex === -1) {
      links.push({ url: url, text: url });
      existingLinkIndex = links.length - 1;
    }
    processedText = processedText.replace(url, `[LINK:${existingLinkIndex}]`);
  });

  return { processedText, links };
}
// types
export interface Step {
  name: string;
  status: "pending" | "completed";
  is_final?: boolean;
  deliverable_link?: string;
  metadata?: {
    text?: string;
    type?: string;
    links?: any[];
    images?: string[];
    created_at?: string;
    step_index?: number;
  };
}

export interface ProjectTrack {
  id: string;
  round_number: number;
  status: string;
  client_decision: string;
  steps: Step[];
  created_at: string;
  updated_at: string;
}

export interface Project {
  client_email: string;
  client_name: string;
  password_protected: any;
  id: string;
  title: string;
  description?: string;
  status: string;
  deadline?: string;
  created_at: string;
  updated_at?: string;
  client?: {
    id: string;
    name: string;
  };
  project_tracks?: ProjectTrack[];
  latestTrack?: ProjectTrack | null;
  latestTrackUpdate?: string;
}

export interface Client {
  id: string;
  name: string;
  company?: string;
  projects?: { id: string }[];
  created_at?: string;
}

export interface Stats {
  monthly: {
    activeProjects: number;
    pendingProjects: number;
    completedProjects: number;
    newClients: number;
  };
  allTime: {
    activeProjects: number;
    pendingProjects: number;
    completedProjects: number;
    totalClients: number;
  };
}
export interface Track {
  id: string;
  project_id: string;
  round_number: number;
  status: string;
  steps: Array<{
    status: string;
    metadata?: {
      timestamp: number;
      text: string;
      links?: Array<{ url: string; text: string }>;
      images?: string[];
    };
    deliverable_link?: string;
  }>;
  client_decision?: string;
  created_at: string;
  updated_at: string;
}
export interface Comment {
  commenter_display_name: string;
  isOwnComment: boolean;
  id: string;
  created_at: string;
  comment: {
    text: string;
    timestamp: number;
    images: string[];
    links: Array<{ url: string; text: string }>;
  };
}
