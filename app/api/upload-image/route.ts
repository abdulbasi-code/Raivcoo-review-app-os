// app/api/upload-image/route.ts
// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";

const AVATAR_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Validate file size
    if (image.size > AVATAR_MAX_SIZE) {
      return NextResponse.json(
        {
          error: `File size exceeds ${AVATAR_MAX_SIZE / (1024 * 1024)}MB limit`,
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(image.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG and WebP are supported" },
        { status: 400 }
      );
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a new form for ImgBB
    const imgbbFormData = new FormData();
    imgbbFormData.append("image", new Blob([buffer], { type: image.type }));

    // Upload to ImgBB
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      {
        method: "POST",
        body: imgbbFormData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("ImgBB API Error:", errorData);
      return NextResponse.json(
        { error: `Upload failed: ${response.status} ${response.statusText}` },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (!data.data?.url) {
      return NextResponse.json(
        { error: "Invalid response from ImgBB" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data.data.url });
  } catch (error) {
    console.error("Error in image upload:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
