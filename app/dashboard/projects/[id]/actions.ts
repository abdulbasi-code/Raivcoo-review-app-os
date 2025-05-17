// app/projects/actions.ts
// @ts-nocheck
"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { Buffer } from "buffer"; 

const MAX_IMAGES_PER_COMMENT = 4;
const IMAGE_MAX_SIZE_MB = 5; // 5MB limit for each image
const IMAGE_MAX_SIZE_BYTES = IMAGE_MAX_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];


async function uploadImageToImgBB(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  // Validate file size
  if (fileBuffer.length > IMAGE_MAX_SIZE_BYTES) {
    throw new Error(
      `File "${fileName}" size exceeds ${IMAGE_MAX_SIZE_MB}MB limit.`
    );
  }
  // Validate file type
  if (!ACCEPTED_IMAGE_TYPES.includes(contentType)) {
    throw new Error(
      `File "${fileName}" has an invalid type (${contentType}). Only JPEG, PNG, and WebP are supported.`
    );
  }
  const formData = new FormData();
 
  formData.append("image", new Blob([fileBuffer], { type: contentType }));
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    console.error("IMGBB_API_KEY environment variable is not set.");
    throw new Error("Image upload service is not configured.");
  }

  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("ImgBB API Error:", errorData);
      throw new Error(
        `Upload failed for "${fileName}": ${response.status} ${response.statusText} - ${errorData?.error?.message || "Unknown ImgBB error"}`
      );
    }

    const data = await response.json();

    if (!data.data?.url) {
      console.error("Invalid response structure from ImgBB:", data);
      throw new Error(
        `Invalid response from ImgBB after uploading "${fileName}".`
      );
    }

    return data.data.url; 
  } catch (error) {
    console.error(`Error uploading ${fileName} to ImgBB:`, error);
    
    throw new Error(
      `Failed to upload image "${fileName}": ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

interface Step {
  name?: string;
  status: "pending" | "completed";
  is_final?: boolean;
  deliverable_link?: string | null;
  metadata?: {
    type: "comment" | "general_revision";
    comment_id?: string;
    text?: string;
    timestamp?: number;
    images?: string[];
    links?: { url: string; text: string }[];
    created_at?: string;
    step_index?: number;
  };
}

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: editorProfile, error: profileError } = await supabase
    .from("editor_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (profileError || !editorProfile)
    throw new Error("Failed to fetch editor profile");


  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const deadline = formData.get("deadline") as string;
  const commentsData = formData.get("comments") as string;


  const clientName = formData.get("client_name") as string;
  const clientEmail = formData.get("client_email") as string;


  const passwordProtected =
    (formData.get("password_protected") as string) === "true";
  const accessPassword = passwordProtected
    ? (formData.get("access_password") as string)
    : null;

  if (!title || !commentsData || !clientName)
    throw new Error("Project title, client name, and work steps are required");

  try {
   
    const comments = JSON.parse(commentsData) as {
      text: string;
      images: string[];
    }[];

    
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        editor_id: editorProfile.id,
        title,
        description: description || null,
        deadline: deadline || null,
        status: "active",
       
        client_name: clientName,
        client_email: clientEmail || null,
        
        password_protected: passwordProtected,
        access_password: accessPassword,
      })
      .select("id")
      .single();
    if (projectError) throw projectError;

  
    const steps: Step[] = [];

    for (const [index, comment] of comments.entries()) {
      let imageUrls: string[] = [];

      
      if (comment.images && comment.images.length > 0) {
        const uploadPromises = comment.images.map(
          async (fileName, imgIndex) => {
            const fileKey = `image_${index}_${imgIndex}`;
            const file = formData.get(fileKey) as File;
            if (!file) return null;

            const buffer = Buffer.from(await file.arrayBuffer());
            return await uploadImageToImgBB(buffer, file.name, file.type);
          }
        );

        const results = await Promise.all(uploadPromises);
        imageUrls = results.filter((url): url is string => url !== null);
      }

     
      const { processedText, links } = detectAndExtractLinks(comment.text);

      steps.push({
        name: `Step ${index + 1}`,
        status: "pending" as const,
        metadata: {
          type: "comment",
          text: processedText,
          images: imageUrls,
          links: links,
          created_at: new Date().toISOString(),
          step_index: index,
        },
      });
    }

    // Add final step (but marked as pending)
    steps.push({
      name: "Finish",
      is_final: true,
      status: "pending" as const,
      deliverable_link: null,
    });

    // Create initial track with the steps
    const { error: trackError } = await supabase.from("project_tracks").insert({
      project_id: project.id,
      round_number: 1,
      status: "in_progress",
      steps: steps,
      client_decision: "pending",
    });

    if (trackError) {
      console.error("Error creating initial track:", trackError);
      await supabase.from("projects").delete().eq("id", project.id);
      throw new Error("Failed to create the initial workflow track.");
    }

    console.log(
      `Project ${project.id} created successfully with initial steps.`
    );
    revalidatePath("/projects");
    return { message: "Project created successfully with work steps", project };
  } catch (error) {
    console.error("Full error during project creation:", error);
    throw error instanceof Error
      ? error
      : new Error("An unexpected error occurred during project creation.");
  }
}
export async function updateProjectTrackStepStatus(
  trackId: string,
  stepIndex: number,
  newStatus: "pending" | "completed",
  linkValue?: string, 
  finalMediaType?: "video" | "image" 
) {
  const supabase = await createClient();
  

  
  const { data: trackData, error: trackError } = await supabase
    .from("project_tracks")
    .select("id, project_id, steps, final_deliverable_media_type") 
    .eq("id", trackId)
    .single();

  if (trackError || !trackData) {
    console.error("Error fetching track for status update:", trackError);
    throw new Error(trackError?.message || "Track not found");
  }

  


  const steps = (trackData.steps || []) as Step[]; 
  if (stepIndex < 0 || stepIndex >= steps.length) {
    throw new Error(`Invalid step index: ${stepIndex}`);
  }
  const stepToUpdate = steps[stepIndex];
  if (!stepToUpdate) {
    throw new Error(`Step at index ${stepIndex} not found`);
  }
  const isFinalStep = stepToUpdate.is_final;

  const updatedSteps = [...steps]; 
  const updatedStep = { ...stepToUpdate, status: newStatus }; 
  updatedSteps[stepIndex] = updatedStep; 

  // Prepare the payload for the main track row update
  const trackUpdatePayload: {
    steps: Step[];
    updated_at: string;
    final_deliverable_media_type?: "video" | "image" | null;
  } = {
    steps: updatedSteps, 
    updated_at: new Date().toISOString(),
  
    final_deliverable_media_type: trackData.final_deliverable_media_type,
  };

 
  if (isFinalStep) {
    if (newStatus === "completed" && linkValue && finalMediaType) {
   
      updatedStep.deliverable_link = linkValue;
  
      trackUpdatePayload.final_deliverable_media_type = finalMediaType;
    } else if (newStatus === "pending") {
    
      updatedStep.deliverable_link = null;
    
      trackUpdatePayload.final_deliverable_media_type = null;
    }
 
    trackUpdatePayload.steps = updatedSteps;
  }

 
  const { error: updateError } = await supabase
    .from("project_tracks")
    .update(trackUpdatePayload) 
    .eq("id", trackId);

  if (updateError) {
    console.error("Error updating track status/type:", updateError);
    throw new Error(updateError.message || "Failed to update track");
  }

  
  if (trackData.project_id) {
    revalidatePath(`/dashboard/projects/${trackData.project_id}`);
    revalidatePath(`/review/${trackId}`); // Adjust if review path includes project ID
  } else {
    revalidatePath(`/dashboard/projects/[id]`, "page");
    revalidatePath("/review/[trackId]", "page");
  }

  return { message: "Step status updated successfully" };
}

export async function updateTrackStructure(
  trackId: string,
  
  newStepsStructure: Omit<Step, "status" | "deliverable_link" | "is_final">[]
) {
  if (!trackId || !Array.isArray(newStepsStructure)) {
    throw new Error("Invalid parameters: Track ID and steps array required.");
  }
 

  const supabase = await createClient();
  const {
    data: { user },
    error: userAuthError,
  } = await supabase.auth.getUser();
  if (userAuthError || !user) throw new Error("Editor not authenticated");

  const { data: editorProfile, error: profileError } = await supabase
    .from("editor_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (profileError || !editorProfile)
    throw new Error("Editor profile not found.");

  try {
    const { data: track, error: trackError } = await supabase
      .from("project_tracks")
      .select(
        `id, project_id, steps, client_decision, project:projects!inner(id, editor_id)`
      )
      .eq("id", trackId)
      .single();

    if (trackError || !track || !track.project) {
      throw new Error("Track or associated project not found.");
    }
    if (track.project.editor_id !== editorProfile.id) {
      throw new Error(
        "Unauthorized: Project track does not belong to this editor."
      );
    }
    if (track.client_decision !== "pending") {
      throw new Error(
        `Client decision is '${track.client_decision}'. Cannot modify structure.`
      );
    }

    const originalSteps = (track.steps as Step[]) || [];
    const originalFinishStep = originalSteps.find((s) => s.is_final);

    if (!originalFinishStep) {
      console.error(`Track ${trackId} is missing the 'Finish' step!`);
      throw new Error(
        "Critical error: Track is missing the mandatory 'Finish' step."
      );
    }

  
    const oldStepMap = new Map<string, Step>();
    originalSteps.forEach((step) => {
      if (!step.is_final && step.metadata?.comment_id) {
        oldStepMap.set(step.metadata.comment_id, step);
      }
    });


    const finalNewSteps: Step[] = newStepsStructure.map(
      (newStepInfo, index) => {
     
        const oldStep = newStepInfo.metadata?.comment_id
          ? oldStepMap.get(newStepInfo.metadata.comment_id)
          : undefined;

 
        return {
          name: newStepInfo.name || `Step ${index + 1}`, 
          status: oldStep?.status || "pending", 
          is_final: false, 
          deliverable_link: null, 
        
          metadata: {
            ...(oldStep?.metadata || {}), 
            ...(newStepInfo.metadata || {}), 
            type: oldStep?.metadata?.type || "comment",
            comment_id:
              oldStep?.metadata?.comment_id || newStepInfo.metadata?.comment_id, 
          },
        };
      }
    );

    
    finalNewSteps.push(originalFinishStep);

    
    const { error: updateError } = await supabase
      .from("project_tracks")
      .update({ steps: finalNewSteps, updated_at: new Date().toISOString() })
      .eq("id", trackId);

    if (updateError) {
      console.error("Database error updating track structure:", updateError);
      throw new Error(
        `Database error updating track structure: ${updateError.message}`
      );
    }

    console.log(`Track ${trackId} structure updated successfully.`);

    // Revalidate Cache
    revalidatePath(`/dashboard/projects/${track.project_id}`);
    revalidatePath(`/review/${trackId}`);
    revalidatePath(`/projects/${track.project_id}/review/${trackId}`); 

    return { message: "Workflow steps updated successfully." };
  } catch (error) {
    console.error("Full error in updateTrackStructure:", error);
    throw error instanceof Error
      ? error
      : new Error(
          "An unexpected error occurred while updating workflow steps."
        );
  }
}

export async function updateStepContent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Editor not authenticated");

  
  const trackId = formData.get("trackId") as string;
  const stepIndexString = formData.get("stepIndex") as string;

  const textFromEditor = ((formData.get("text") as string) || "").trim();
  const existingImagesString = formData.get("existingImages") as string;
  const newImageFiles = formData.getAll("newImages") as File[];

  if (trackId === null || stepIndexString === null) {
    throw new Error("Missing track ID or step index.");
  }
  const stepIndex = parseInt(stepIndexString, 10);
  if (isNaN(stepIndex) || stepIndex < 0) {
    throw new Error("Invalid step index.");
  }

  let imagesToKeep: string[] = [];
  if (existingImagesString) {
    try {
      imagesToKeep = JSON.parse(existingImagesString);
      if (!Array.isArray(imagesToKeep)) imagesToKeep = [];
    } catch (e) {
      console.error("Failed to parse existing images JSON", e);
      imagesToKeep = [];
    }
  }


  const { data: track, error: trackError } = await supabase
    .from("project_tracks")
    .select(
      `id, project_id, steps, client_decision, project:projects!inner(id, editor_id)`
    )
    .eq("id", trackId)
    .single();
  if (trackError || !track || !track.project)
    throw new Error("Track or associated project not found.");


  const { data: editorProfile, error: profileError } = await supabase
    .from("editor_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (
    profileError ||
    !editorProfile ||
    track.project.editor_id !== editorProfile.id
  ) {
    throw new Error(
      "Unauthorized: Project track does not belong to this editor."
    );
  }


  if (track.client_decision !== "pending") {
    throw new Error(
      `Client has already submitted their decision (${track.client_decision}). Cannot modify step content.`
    );
  }


  let steps = track.steps as Step[] | null;
  if (!Array.isArray(steps) || stepIndex >= steps.length) {
    console.error(`Invalid step index ${stepIndex} for steps array:`, steps);
    throw new Error("Invalid step index or steps format issue.");
  }
  const stepToUpdate = steps[stepIndex];


  if (stepToUpdate.is_final) {
    throw new Error(
      "The final deliverable step content cannot be edited directly."
    );
  }


  const { processedText, links } = detectAndExtractLinks(textFromEditor);
 
  const uploadedNewImageUrls: string[] = [];
  if (newImageFiles.length > 0) {
    const totalImages = imagesToKeep.length + newImageFiles.length;
    if (totalImages > MAX_IMAGES_PER_COMMENT) {
      throw new Error(
        `Cannot exceed ${MAX_IMAGES_PER_COMMENT} images in total.`
      );
    }
    try {
      const uploadPromises = newImageFiles
        .filter((file) => file.size > 0)
        .map(async (file) => {
          const buffer = Buffer.from(await file.arrayBuffer());
          return await uploadImageToImgBB(buffer, file.name, file.type);
        });
      const results = await Promise.all(uploadPromises);
      uploadedNewImageUrls.push(
        ...results.filter((url): url is string => url !== null)
      );
    } catch (uploadError) {
      console.error("Error during image upload batch:", uploadError);
      throw uploadError instanceof Error
        ? uploadError
        : new Error("Failed to upload one or more new images.");
    }
  }


  const finalImageUrls = [...imagesToKeep, ...uploadedNewImageUrls];

  const currentMetadata = stepToUpdate.metadata || {
    type: "comment",
    created_at: new Date().toISOString(),
  };

  const updatedMetadata = {
    ...currentMetadata, 
    text: processedText, 
    links: links, 
    images: finalImageUrls, 
  };

  
  steps[stepIndex] = {
    ...stepToUpdate,
    metadata: updatedMetadata,
  };

  
  try {
    const { error: updateError } = await supabase
      .from("project_tracks")
      .update({ steps: steps, updated_at: new Date().toISOString() })
      .eq("id", trackId);
    if (updateError) throw updateError;

    console.log(`Step ${stepIndex} content updated for track ${trackId}.`);

    // 9. Revalidate Cache
    revalidatePath(`/dashboard/projects/${track.project_id}`);
    revalidatePath(`/review/${trackId}`);
    revalidatePath(`/projects/${track.project_id}/review/${trackId}`);

    return { message: "Step content updated successfully." };
  } catch (error) {
    console.error("Full error in updateStepContent database update:", error);
    throw error instanceof Error
      ? error
      : new Error("An unexpected error occurred while updating step content.");
  }
}

export async function deliverInitialRound(
  trackId: string,
  deliverableLink: string,
  comments: {
    text: string;
    images?: File[];
    links?: { url: string; text: string }[];
  }[]
) {
  const supabase = await createClient();

  const { data: track, error: trackError } = await supabase
    .from("project_tracks")
    .select("id, project_id, round_number, steps")
    .eq("id", trackId)
    .eq("round_number", 1)
    .single();

  if (trackError || !track) {
    throw new Error(trackError?.message || "Initial track not found");
  }


  const steps: Step[] = [];

  for (const comment of comments) {
    let imageUrls: string[] = [];


    if (comment.images && comment.images.length > 0) {
      try {
        const uploadPromises = comment.images.map(async (file) => {
          const buffer = Buffer.from(await file.arrayBuffer());
          return await uploadImageToImgBB(buffer, file.name, file.type);
        });
        imageUrls = await Promise.all(uploadPromises);
      } catch (error) {
        console.error("Error uploading images:", error);
        throw new Error("Failed to upload one or more images");
      }
    }


    const { processedText, links } = detectAndExtractLinks(comment.text);

    steps.push({
      status: "completed" as const,
      metadata: {
        type: "comment",
        text: processedText,
        images: imageUrls,
        links: links,
        created_at: new Date().toISOString(),
        step_index: steps.length,
      },
    });
  }


  steps.push({
    is_final: true,
    status: "completed" as const,
    deliverable_link: deliverableLink,
  });


  const { error: updateError } = await supabase
    .from("project_tracks")
    .update({
      steps: steps,
      status: "in_review",
      updated_at: new Date().toISOString(),
    })
    .eq("id", trackId);

  if (updateError) {
    throw new Error(updateError.message || "Failed to deliver initial round");
  }

  // 4. Revalidate paths
  revalidatePath(`/projects/${track.project_id}`);
  revalidatePath(`/dashboard/projects/${track.project_id}`);

  return { message: "Initial round delivered successfully" };
}

function detectAndExtractLinks(text: string) {
 
  const urlRegex = /(?<!\[LINK:)(\bhttps?:\/\/[^\s<>"]+)/g;


  const links: { url: string; text: string }[] = [];
  let processedText = text;
  let match;


  const urlMatches = Array.from(text.matchAll(urlRegex));

  urlMatches.forEach((match) => {
    const url = match[0];
    
    let existingLinkIndex = links.findIndex((link) => link.url === url);

    if (existingLinkIndex === -1) {
     
      links.push({
        url: url,
        text: url, 
      });
      existingLinkIndex = links.length - 1; 
    }

    
    processedText = processedText.replace(url, `[LINK:${existingLinkIndex}]`);
  });


  return { processedText, links };
}

export async function createInitialRound(
  projectId: string,
  trackId: string,
  comments: {
    text: string;
    images?: File[];
    links?: { url: string; text: string }[];
  }[]
) {
  const supabase = await createClient();


  const { data: track, error: trackError } = await supabase
    .from("project_tracks")
    .select("id, project_id, round_number, steps")
    .eq("id", trackId)
    .eq("round_number", 1)
    .single();

  if (trackError || !track) {
    throw new Error(trackError?.message || "Initial track not found");
  }


  const steps: Step[] = [];

  for (const comment of comments) {
    let imageUrls: string[] = [];


    if (comment.images && comment.images.length > 0) {
      try {
        const uploadPromises = comment.images.map(async (file) => {
          const buffer = Buffer.from(await file.arrayBuffer());
          return await uploadImageToImgBB(buffer, file.name, file.type);
        });
        imageUrls = await Promise.all(uploadPromises);
      } catch (error) {
        console.error("Error uploading images:", error);
        throw new Error("Failed to upload one or more images");
      }
    }


    const { processedText, links } = detectAndExtractLinks(comment.text);

    steps.push({
      name: `Step ${steps.length + 1}`,
      status: "pending" as const,
      metadata: {
        type: "comment",
        text: processedText,
        images: imageUrls,
        links: links,
        created_at: new Date().toISOString(),
        step_index: steps.length,
      },
    });
  }


  steps.push({
    name: "Finish",
    is_final: true,
    status: "pending" as const,
    deliverable_link: null,
  });


  const { error: updateError } = await supabase
    .from("project_tracks")
    .update({
      steps: steps,
      status: "in_progress",
      updated_at: new Date().toISOString(),
    })
    .eq("id", trackId);

  if (updateError) {
    throw new Error(updateError.message || "Failed to create initial round");
  }

  // 4. Revalidate paths
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}`);

  return { message: "Initial round created successfully" };
}

export async function updateAllStepContent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Editor not authenticated");
 
 
  const trackId = formData.get("trackId") as string;
  const stepsStructureString = formData.get("stepsStructure") as string;
  const stepsToProcessString = formData.get("stepsToProcess") as string;
  const stepsWithNewImagesString = formData.get("stepsWithNewImages") as string;
  
  if (!trackId || !stepsStructureString) {
    throw new Error("Missing track ID or steps structure.");
  }
 

  let stepsStructure;
  let stepsToProcess;
  let stepsWithNewImages;
  try {
    stepsStructure = JSON.parse(stepsStructureString);
    stepsToProcess = JSON.parse(stepsToProcessString);
    stepsWithNewImages = JSON.parse(stepsWithNewImagesString);
  } catch (e) {
    console.error("Failed to parse steps data", e);
    throw new Error("Invalid steps data format.");
  }
 
  
  const { data: track, error: trackError } = await supabase
    .from("project_tracks")
    .select(
      `id, project_id, steps, client_decision, project:projects!inner(id, editor_id)`
    )
    .eq("id", trackId)
    .single();
    
  if (trackError || !track || !track.project)
    throw new Error("Track or associated project not found.");
 

  const { data: editorProfile, error: profileError } = await supabase
    .from("editor_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (
    profileError ||
    !editorProfile ||
    track.project.editor_id !== editorProfile.id
  ) {
    throw new Error(
      "Unauthorized: Project track does not belong to this editor."
    );
  }

  if (track.client_decision !== "pending") {
    throw new Error(
      `Client has already submitted their decision (${track.client_decision}). Cannot modify.`
    );
  }
 

  const currentSteps = track.steps as Step[];
  
 
  const timestampMap = new Map();
  currentSteps.forEach(step => {
    if (step.metadata?.comment_id && step.metadata?.timestamp !== undefined) {
      timestampMap.set(step.metadata.comment_id, step.metadata.timestamp);
    }
  });
 

  for (const stepInfo of stepsToProcess) {
    const stepIndex = stepInfo.index;
    const stepData = stepsStructure[stepIndex];
    
    if (!stepData || !stepData.metadata) continue;
    
    
    const { processedText, links } = detectAndExtractLinks(stepData.metadata.text || "");
    

    const existingTimestamp = stepData.metadata.timestamp;
    const commentId = stepData.metadata.comment_id;
    const preservedTimestamp = existingTimestamp !== undefined 
      ? existingTimestamp 
      : commentId && timestampMap.has(commentId)
        ? timestampMap.get(commentId)
        : 0; // Default to 0 if no timestamp exists
    

    stepData.metadata = {
      ...stepData.metadata,
      text: processedText,
      links: links,
      timestamp: preservedTimestamp
    };
  }
 

  for (const stepInfo of stepsWithNewImages) {
    const stepIndex = stepInfo.index;
    const stepData = stepsStructure[stepIndex];
    
    if (!stepData || !stepData.metadata) continue;
    
 
    const newImageUrls = [];
    let fileIndex = 0;
    let file = formData.get(`newImage_${stepIndex}_${fileIndex}`);
    
    while (file) {
      if (file instanceof File && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        try {
          const imageUrl = await uploadImageToImgBB(buffer, file.name, file.type);
          newImageUrls.push(imageUrl);
        } catch (error) {
          console.error(`Error uploading image for step ${stepIndex}:`, error);
          throw error;
        }
      }
      fileIndex++;
      file = formData.get(`newImage_${stepIndex}_${fileIndex}`);
    }
   
    if (newImageUrls.length > 0) {
      const existingImages = stepData.metadata.images || [];
      stepData.metadata = {
        ...stepData.metadata,
        images: [...existingImages, ...newImageUrls]
      };
    }
  }
  
  
  try {
    const { error: updateError } = await supabase
      .from("project_tracks")
      .update({ 
        steps: stepsStructure, 
        updated_at: new Date().toISOString() 
      })
      .eq("id", trackId);
      
    if (updateError) throw updateError;
    
    // Revalidate paths
    revalidatePath(`/dashboard/projects/${track.project_id}`);
    revalidatePath(`/review/${trackId}`);
    revalidatePath(`/projects/${track.project_id}/review/${trackId}`);
    
    return { message: "All steps updated successfully." };
  } catch (error) {
    console.error("Database update error:", error);
    throw error instanceof Error
      ? error
      : new Error("An unexpected error occurred while updating steps.");
  }
 }












 