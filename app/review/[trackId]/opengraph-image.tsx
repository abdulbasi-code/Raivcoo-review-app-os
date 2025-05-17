// app/review/[trackId]/opengraph-image.tsx

import { ImageResponse } from "next/og";
import { createClient } from "@/utils/supabase/server";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: { trackId: string };
}) {
  const supabase = await createClient();
  const { trackId } = params;

  const { data: trackData } = await supabase
    .from("project_tracks")
    .select(`steps, project:projects!inner(title, client_name)`)
    .eq("id", trackId)
    .maybeSingle();

  const project: any = trackData?.project;
  const projectTitle = project?.title || "Project Title";
  const clientName = project?.client_name || "Client";

  const steps = Array.isArray(trackData?.steps) ? trackData.steps : [];
  const finalStep = steps.find((step: any) => step?.is_final);

  function isValidImageUrl(url: string | undefined): boolean {
    if (!url) return false;

    try {
      new URL(url);
      // Check if it's not a Dropbox video
      if (/dropbox\.com/.test(url) && finalStep?.metadata?.type === "video") {
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  function getThumbnailFromDeliverable(
    deliverable: string | undefined,
    type: "image" | "video" | undefined
  ): string | undefined {
    if (!deliverable) return undefined;

    // Block Dropbox videos
    if (type === "video" && /dropbox\.com/.test(deliverable)) {
      return undefined;
    }

    // Allow Dropbox image links with direct download
    if (type === "image" && /dropbox\.com/.test(deliverable)) {
      if (!deliverable.includes("dl=1")) {
        if (deliverable.includes("?")) {
          return `${deliverable}&dl=1`;
        } else {
          return `${deliverable}?dl=1`;
        }
      }
      return deliverable;
    }

    const ytMatch = deliverable.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
    );
    if (ytMatch)
      return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;

    const vimeoMatch = deliverable.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://vumbnail.com/${vimeoMatch[1]}.jpg`;

    const driveMatch = deliverable.match(
      /drive\.google\.com\/file\/d\/([^/]+)/
    );
    if (driveMatch)
      return `https://drive.google.com/thumbnail?id=${driveMatch[1]}`;

    return deliverable;
  }

  // Get thumbnail URL
  const thumbnailUrl = getThumbnailFromDeliverable(
    finalStep?.deliverable_link,
    finalStep?.metadata?.type
  );

  // Check if we have a valid URL
  const hasValidImage = isValidImageUrl(thumbnailUrl);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          fontFamily: "sans-serif",
          backgroundImage: `url(${process.env.DOMAIN_URL}/ogFrameImage.png)`,
          backgroundColor: "#000",
          color: "white",
        }}
      >
        {/* Left Panel */}
        <div
          style={{
            width: "50%",
            padding: "60px",
            display: "flex",
            marginTop: "50px",
            marginLeft: "-20px",
            flexDirection: "column",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          <div style={{ fontSize: 40, fontWeight: "bold", lineHeight: 1.2 }}>
            {projectTitle.length > 60
              ? projectTitle.slice(0, 60) + "…"
              : projectTitle}
          </div>
          <div style={{ fontSize: 28, color: "#ccc" }}>
            {clientName.length > 40
              ? clientName.slice(0, 40) + "…"
              : clientName}
          </div>
        </div>

        {/* Right Panel */}
        <div
          style={{
            width: "50%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
          }}
        >
          <div
            style={{
              width: "600px",
              height: "337.5px",
              display: "flex",
              marginLeft: "-50px",
              marginTop: "50px",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "12px",
              overflow: "hidden",
              backgroundColor: "#222",
              border: "4px solid #fff",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
            }}
          >
            {hasValidImage ? (
              <img
                src={thumbnailUrl}
                alt="Review Thumbnail"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              // Placeholder content
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#333",
                  color: "#fff",
                  padding: "20px",
                  textAlign: "center",
                }}
              >
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <div style={{ fontSize: "24px", marginTop: "16px" }}>
                  Preview Not Available
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    size
  );
}