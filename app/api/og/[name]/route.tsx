import { ImageResponse } from "next/og";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";



interface Language {
  level: string;
  language: string;
}

interface SoftwareSkill {
  software: string;
  yearsOfExperience: number;
}

interface Profile {
  full_name: string;
  display_name: string;
  avatar_url: string;
  biography: string;
  software_proficiency: SoftwareSkill[];
  languages: Language[];
  availability: boolean;
  og_image: {
    url: string;
  } | null;
}

export async function GET(
  request: Request,
  props: { params: Promise<{ name: string }> }
) {
  const params = await props.params;
  try {
    const headersList = await headers();
    const host = headersList.get("host") || "";
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const supabase = createClient();
    const displayName = decodeURIComponent(params.name);

    const { data: profile, error } = await (
      await supabase
    )
      .from("editor_profiles")
      .select(
        `
        full_name,
        display_name,
        avatar_url,
        biography,
        software_proficiency,
        languages,
        availability,
        og_image
      `
      )
      .ilike("display_name", displayName)
      .single();

    if (error || !profile) {
      return new ImageResponse(
        (
          <div
            style={{
              display: "flex",
              width: "1200px",
              height: "630px",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f4f4f5",
              color: "#18181b",
              fontSize: "48px",
            }}
          >
            Profile Not Found
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    // If custom OG image exists, redirect to it
    if (profile.og_image?.url) {
      return new Response(JSON.stringify({ url: profile.og_image.url }), {
        status: 302,
        headers: {
          Location: profile.og_image.url,
          "Content-Type": "application/json",
        },
      });
    }

    // Generate dynamic OG image if no custom one exists
    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            position: "relative",
            color: "white",
            fontFamily: "sans-serif",
          }}
        >
          <img
            src={`${baseUrl}/ogImage.png`}
            alt="Background"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "blur(5px) brightness(0.5)",
              zIndex: 0,
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <img
                src={profile.avatar_url || "/placeholder.svg"}
                alt={profile.full_name}
                width={228}
                height={228}
                style={{
                  borderRadius: "9999px",
                  border: profile.availability
                    ? "4px solid rgba(34, 197, 94, 0.9)"
                    : "4px solid rgba(239, 68, 68, 0.9)",
                  boxShadow: profile.availability
                    ? "0 0 0 2px rgba(34, 197, 94, 0.3)"
                    : "0 0 0 2px rgba(239, 68, 68, 0.3)",
                }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <h1
                  style={{
                    fontSize: "64px",
                    margin: "0",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  {profile.full_name}
                </h1>
                <p
                  style={{
                    fontSize: "32px",
                    margin: "0",
                    opacity: "0.9",
                    textAlign: "center",
                  }}
                >
                  Professional Video Editor
                </p>
              </div>
            </div>

            <div
              style={{
                position: "absolute",
                bottom: "48px",
                right: "48px",
                display: "flex",
              }}
            >
              <p
                style={{
                  fontSize: "20px",
                  opacity: 0.8,
                  margin: 0,
                }}
              >
                {profile.display_name}.TEST.com
              </p>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f4f4f5",
            fontSize: "24px",
            color: "#18181b",
          }}
        >
          Failed to generate preview image
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
