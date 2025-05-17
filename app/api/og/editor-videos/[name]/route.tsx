import { ImageResponse } from "next/og";
import { createClient } from "@/utils/supabase/server";

interface VideoSample {
  url: string;
  type: string;
  genre: string;
  source: string;
  category: string;
}

export async function GET(request: Request, props: { params: Promise<{ name: string }> }) {
  const params = await props.params;
  const supabase = createClient();
  const displayName = decodeURIComponent(params.name);

  const { data: editor, error: editorError } = await (await supabase)
    .from("editor_profiles")
    .select("*")
    .ilike("display_name", displayName)
    .single();

  if (editorError || !editor) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: "white",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#000",
            fontFamily: "Arial, sans-serif",
          }}
        >
          Editor Not Found
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }

  const videoSamples: VideoSample[] = editor.video_samples || [];
  const displayVideos = videoSamples.slice(0, 4);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "20px",
              width: "100%",
              justifyContent: "center",
            }}
          >
            <img
              src={editor.avatar_url}
              alt={`${editor.full_name}'s avatar`}
              width="150"
              height="150"
              style={{
                borderRadius: "50%",
                marginRight: "20px",
              }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <h1
                style={{
                  fontSize: "48px",
                  fontWeight: "bold",
                  color: "#000",
                  margin: 0,
                }}
              >
                {editor.full_name}
              </h1>
              <h2
                style={{
                  fontSize: "30px",
                  color: "#666",
                  margin: 0,
                }}
              >
                @{editor.display_name}
              </h2>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h3
              style={{
                fontSize: "70px",
                fontWeight: "bold",
                color: "#000",
                margin: 0,
                textAlign: "center",
              }}
            >
              Editor All Videos
            </h3>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            marginTop: "40px",
          }}
        ></div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
