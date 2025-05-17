// app/review/[trackId]/actions.ts
// @ts-nocheck
"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { Buffer } from "buffer";
import { cookies } from "next/headers";
import { Step } from "@/app/dashboard/projects/[id]/TrackManager";

interface CommentData {
  text: string;
  timestamp: number;
  images?: string[];
  links?: { url: string; text: string }[];
}

const MAX_IMAGES_PER_COMMENT = 4;
const IMAGE_MAX_SIZE_MB = 5;
const IMAGE_MAX_SIZE_BYTES = IMAGE_MAX_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function detectAndExtractLinks(text: string) {
  const urlRegex = /(https?:\/\/[^\s<>"]+)/g;
  const links: { url: string; text: string }[] = [];
  let processedText = text;
  const urlMatches = Array.from(text.matchAll(urlRegex));
  urlMatches.forEach((match) => {
    const url = match[0];
    if (text.substring(match.index - 6, match.index) === "[LINK:") {
      return;
    }
    let existingLinkIndex = links.findIndex((link) => link.url === url);
    if (existingLinkIndex === -1) {
      links.push({ url: url, text: url });
      existingLinkIndex = links.length - 1;
    }
    processedText = processedText.replace(url, `[LINK:${existingLinkIndex}]`);
  });
  return { processedText, links };
}

async function uploadImageToImgBB(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  if (fileBuffer.length > IMAGE_MAX_SIZE_BYTES)
    throw new Error(
      `File "${fileName}" size exceeds ${IMAGE_MAX_SIZE_MB}MB limit.`
    );
  if (!ACCEPTED_IMAGE_TYPES.includes(contentType))
    throw new Error(
      `File "${fileName}" has an invalid type. Only JPEG, PNG, WebP allowed.`
    );

  const formData = new FormData();
  formData.append("image", new Blob([fileBuffer], { type: contentType }));

  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    console.error("IMGBB_API_KEY missing.");
    throw new Error("Image upload service not configured.");
  }

  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      { method: "POST", body: formData }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("ImgBB API Error:", errorData);
      throw new Error(
        `Upload failed: ${response.statusText} - ${errorData?.error?.message || "ImgBB error"}`
      );
    }
    const data = await response.json();
    if (!data.data?.url) {
      console.error("Invalid ImgBB response:", data);
      throw new Error(`Invalid ImgBB response.`);
    }
    return data.data.url;
  } catch (error) {
    console.error(`Error uploading ${fileName} to ImgBB:`, error);
    throw new Error(
      `Image upload failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function addReviewComment(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const trackId = formData.get("trackId") as string;
  const timestampString = formData.get("timestamp") as string;
  const commentText = formData.get("commentText") as string;
  const commenterName =
    (formData.get("commenterName") as string) || "Anonymous Visitor";
  const imageFiles = formData.getAll("images") as File[];
  const linksString = formData.get("links") as string;

  let links;
  if (linksString) {
    try {
      links = JSON.parse(linksString);
    } catch (e) {
      console.error("Error parsing links JSON:", e);
    }
  }

  if (!trackId || !timestampString) throw new Error("Required data missing.");
  if (!commentText?.trim() && imageFiles.length === 0)
    throw new Error("Comment cannot be empty.");

  const timestamp = parseFloat(timestampString);
  if (isNaN(timestamp) || timestamp < 0) throw new Error("Invalid timestamp.");
  if (imageFiles.length > MAX_IMAGES_PER_COMMENT)
    throw new Error(`Max ${MAX_IMAGES_PER_COMMENT} images.`);

  // Check if track exists and decision not already made
  const { data: trackData, error: trackError } = await supabase
    .from("project_tracks")
    .select("id, project_id, client_decision")
    .eq("id", trackId)
    .single();

  if (trackError || !trackData) throw new Error("Track not found.");
  if (trackData.client_decision !== "pending")
    throw new Error(`Decision (${trackData.client_decision}) submitted.`);

  // Upload images
  const uploadedImageUrls: string[] = [];
  if (imageFiles.length > 0) {
    try {
      const uploadPromises = imageFiles.map(async (file) => {
        if (file.size === 0) return null;
        const buffer = Buffer.from(await file.arrayBuffer());
        return await uploadImageToImgBB(buffer, file.name, file.type);
      });
      const results = await Promise.all(uploadPromises);
      uploadedImageUrls.push(
        ...results.filter((url): url is string => url !== null)
      );
    } catch (uploadError) {
      throw uploadError instanceof Error
        ? uploadError
        : new Error("Image upload failed.");
    }
  }

  const commentDataToSave: CommentData = {
    text: commentText.trim(),
    timestamp: timestamp,
    ...(uploadedImageUrls.length > 0 && { images: uploadedImageUrls }),
    ...(links && links.length > 0 && { links: links }),
  };

  try {
    const commentInsertData = {
      track_id: trackId,
      comment: commentDataToSave,
      commenter_name: commenterName,
      commenter_id: user?.id || null,
    };

    const { data: newCommentData, error: insertError } = await supabase
      .from("review_comments")
      .insert(commentInsertData)
      .select(`id, created_at, comment, commenter_name, commenter_id`)
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw insertError;
    }

    revalidatePath(`/review/${trackId}`);

    return {
      message: "Comment added successfully",
      comment: {
        id: newCommentData.id,
        created_at: newCommentData.created_at,
        comment: newCommentData.comment as CommentData,
        commenter_display_name:
          newCommentData.commenter_name || "Anonymous Visitor",
        isOwnComment: true,
      },
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error("Failed to add comment.");
  }
}

export async function updateReviewComment(formData: FormData) {
  const supabase = await createClient();
  const commentId = formData.get("commentId") as string;
  const newCommentText = formData.get("newCommentText") as string;
  const existingImagesString = formData.get("existingImages") as string;
  const commenterName = formData.get("commenterName") as string;
  const newImageFiles = formData.getAll("newImages") as File[];

  if (!commentId || newCommentText === null || !existingImagesString)
    throw new Error("Required data missing.");

  let imagesToKeep: string[] = [];
  try {
    imagesToKeep = JSON.parse(existingImagesString);
    if (!Array.isArray(imagesToKeep))
      throw new Error("Invalid existing images format.");
  } catch (e) {
    throw new Error("Failed to parse existing images.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: commentData, error: commentError } = await supabase
    .from("review_comments")
    .select(
      `id, comment, commenter_id, commenter_name, track_id, track:project_tracks!inner (id, project_id, client_decision)`
    )
    .eq("id", commentId)
    .single();

  if (commentError || !commentData || !commentData.track)
    throw new Error("Comment/track not found.");

  const isOwnComment =
    (user && user.id === commentData.commenter_id) ||
    (!commentData.commenter_id && !user);

  if (!isOwnComment) {
    throw new Error("You can only edit your own comments.");
  }

  const { track } = commentData;
  if (track.client_decision !== "pending")
    throw new Error(`Decision (${track.client_decision}) submitted.`);

  // Upload New Images
  const uploadedNewImageUrls: string[] = [];
  if (newImageFiles.length > 0) {
    const totalPotentialImages = imagesToKeep.length + newImageFiles.length;
    if (totalPotentialImages > MAX_IMAGES_PER_COMMENT) {
      throw new Error(
        `Cannot save comment: Exceeds maximum of ${MAX_IMAGES_PER_COMMENT} images.`
      );
    }
    try {
      const uploadPromises = newImageFiles
        .filter((f) => f.size > 0)
        .map(async (file) => {
          const buffer = Buffer.from(await file.arrayBuffer());
          return await uploadImageToImgBB(buffer, file.name, file.type);
        });
      const results = await Promise.all(uploadPromises);
      uploadedNewImageUrls.push(
        ...results.filter((url): url is string => url !== null)
      );
    } catch (uploadError) {
      console.error("Error uploading new images during update:", uploadError);
      throw uploadError instanceof Error
        ? uploadError
        : new Error("Failed to upload one or more new images.");
    }
  }

  // Combine image lists
  const finalImageUrls = [...imagesToKeep, ...uploadedNewImageUrls];

  // Process Text
  const { processedText, links } = detectAndExtractLinks(newCommentText.trim());
  const existingCommentJson = commentData.comment as CommentData;

  // Create final JSONB with updated content
  const updatedCommentJsonb: CommentData = {
    ...existingCommentJson,
    text: processedText,
    links: links,
    images: finalImageUrls,
  };

  // Prevent saving completely empty comment
  if (
    !updatedCommentJsonb.text &&
    (!updatedCommentJsonb.images || updatedCommentJsonb.images.length === 0)
  ) {
    throw new Error("Cannot save comment with no text and no images.");
  }

  const updateData: any = {
    comment: updatedCommentJsonb,
  };

  if (commenterName && commenterName !== commentData.commenter_name) {
    updateData.commenter_name = commenterName;
  }

  try {
    const { data: updatedData, error: updateError } = await supabase
      .from("review_comments")
      .update(updateData)
      .eq("id", commentId)
      .select(`id, created_at, comment, commenter_name`)
      .single();

    if (updateError) throw new Error("Database error updating comment.");

    revalidatePath(`/review/${track.id}`);

    return {
      message: "Comment updated successfully",
      comment: {
        id: updatedData.id,
        created_at: updatedData.created_at,
        comment: updatedData.comment as CommentData,
        commenter_display_name:
          updatedData.commenter_name || "Anonymous Visitor",
        isOwnComment: true,
      },
    };
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("Failed to update comment.");
  }
}

export async function deleteReviewComment(commentId: string) {
  const supabase = await createClient();
  if (!commentId) throw new Error("Comment ID missing.");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: commentData, error: commentError } = await supabase
    .from("review_comments")
    .select(
      `id, commenter_id, track_id, track:project_tracks!inner (id, project_id, client_decision)`
    )
    .eq("id", commentId)
    .single();

  if (commentError || !commentData || !commentData.track) {
    console.warn("Comment not found for delete:", commentError);
    throw new Error("Comment/track not found.");
  }

  const isOwnComment =
    (user && user.id === commentData.commenter_id) ||
    (!commentData.commenter_id && !user);

  if (!isOwnComment) {
    throw new Error("You can only delete your own comments.");
  }

  // Check if decision already made
  const { track } = commentData;
  if (track.client_decision !== "pending")
    throw new Error(`Decision (${track.client_decision}) submitted.`);

  try {
    const { error: deleteError } = await supabase
      .from("review_comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) throw new Error("Database error deleting comment.");

    revalidatePath(`/review/${track.id}`);
    return { message: "Comment deleted successfully" };
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("Failed to delete comment.");
  }
}

export async function clientRequestRevisions(trackId: string) {
  const supabase = await createClient();
  const { data: currentTrack, error: trackError } = await supabase
    .from("project_tracks")
    .select("id, project_id, round_number, client_decision")
    .eq("id", trackId)
    .single();

  if (trackError || !currentTrack) throw new Error("Track not found.");

  // Check if decision is already made
  if (currentTrack.client_decision !== "pending")
    throw new Error(`Decision already submitted.`);

  // Get all comments to use for the next round
  const { data: commentsData, error: commentsError } = await supabase
    .from("review_comments")
    .select("id, comment, created_at")
    .eq("track_id", trackId)
    .order("comment->>timestamp", { ascending: true });

  if (commentsError) throw new Error("Could not retrieve comments.");

  // Create steps for the next round
  const nextRoundSteps: Step[] = (commentsData || []).map((c, i) => ({
    status: "pending",
    metadata: {
      type: "comment",
      comment_id: c.id,
      text: c.comment.text,
      timestamp: c.comment.timestamp,
      images: c.comment.images || [],
      links: c.comment.links || [],
      created_at: c.created_at,
      step_index: i,
    },
  }));

  nextRoundSteps.push({
    name: "Finish Revisions",
    status: "pending",
    is_final: true,
    deliverable_link: null,
  });

  try {
    const { error: rpcError } = await supabase.rpc(
      "handle_client_revision_request_v3",
      {
        p_current_track_id: trackId,
        p_project_id: currentTrack.project_id,
        p_current_round_number: currentTrack.round_number,
        p_next_round_steps: nextRoundSteps,
      }
    );

    if (rpcError) throw rpcError;

    revalidatePath(`/review/${trackId}`);
    return {
      success: true,
      message: `Revisions requested. Round ${currentTrack.round_number + 1} created.`,
    };
  } catch (error: any) {
    throw new Error(
      error?.message
        ? `Revision failed: ${error.message}` +
          (error.hint ? ` | Hint: ${error.hint}` : "")
        : "Failed to request revisions"
    );
  }
}

export async function clientApproveProject(projectId: string, trackId: string) {
  const supabase = await createClient();

  const { data: trackData, error: trackError } = await supabase
    .from("project_tracks")
    .select("id, client_decision")
    .eq("id", trackId)
    .eq("project_id", projectId)
    .single();

  if (trackError || !trackData) throw new Error("Track not found or invalid.");

  // Check if decision is already made
  if (trackData.client_decision !== "pending")
    throw new Error(`Decision already submitted.`);

  try {
    // Call the database function to handle the approval
    const { error: rpcError } = await supabase.rpc(
      "handle_client_approval_v2",
      { p_project_id: projectId, p_track_id: trackId }
    );

    if (rpcError) throw new Error(`Database error: ${rpcError.message}`);

    revalidatePath(`/review/${trackId}`);

    return { message: "Project approved successfully." };
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("Failed to approve project.");
  }
}

export async function verifyProjectPassword(
  projectId: string,
  password: string
) {
  if (!projectId || !password) {
    return { success: false, message: "Missing project ID or password" };
  }

  const supabase = await createClient();

  try {
    // Get the project with its password
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("password_protected, access_password")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      console.error("Project fetch error:", projectError);
      return { success: false, message: "Project not found" };
    }

    // If project is not password protected, auto-success
    if (!project.password_protected) {
      return { success: true, message: "Project is not password protected" };
    }

    // Verify the password
    if (password === project.access_password) {
      // Set cookie to remember this verification for this session
      const cookieStore = cookies();
      (await cookieStore).set(`project_auth_${projectId}`, "verified", {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 60 * 24, // 24 hours
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      return { success: true, message: "Password verified successfully" };
    } else {
      return { success: false, message: "Incorrect password" };
    }
  } catch (error: any) {
    console.error("Password verification error:", error);
    return {
      success: false,
      message: error.message || "An error occurred during verification",
    };
  }
}
