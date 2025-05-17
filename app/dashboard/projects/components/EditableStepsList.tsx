// components/dashboard/projects/EditableStepsList.tsx
// @ts-nocheck
"use client";

import React, { useState, useRef, useEffect } from "react";
import { RevButtons } from "@/components/ui/RevButtons";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Step } from "../[id]/TrackManager";
import { toast } from "@/hooks/use-toast";
import {
  Loader2,
  GripVertical,
  PlusCircle,
  Save,
  Trash2,
  ImageIcon,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { updateAllStepContent } from "../[id]/actions";
import { renderPlainTextWithUrls } from "../../components/libs";

interface EditableStepsListProps {
  trackId: string;
  steps: Step[];
  onSave: (steps: Step[]) => Promise<void>;
  onCancel: () => void;
  updateStepContent: (formData: FormData) => Promise<void>;
  isSaving: boolean;
}

const MAX_IMAGES_PER_COMMENT = 4;
const ACCEPTED_IMAGE_TYPES_STRING = "image/jpeg,image/png,image/webp";


export function EditableStepsList({
  trackId,
  steps,
  onCancel,
  isSaving,
}: EditableStepsListProps) {
  const [editableSteps, setEditableSteps] = useState<
    Array<
      Step & {
        displayText: string;
        newImageFiles: File[];
        hasUnsavedChanges: boolean;
        isSaving: boolean;
      }
    >
  >([]);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    const enhancedSteps = steps.map((step) => ({
      ...step,
      displayText: renderPlainTextWithUrls(
        step.metadata?.text,
        step.metadata?.links
      ),
      newImageFiles: [],
      hasUnsavedChanges: false,
      isSaving: false,
    }));
    setEditableSteps(enhancedSteps);
  }, [steps]);

  const nonFinalSteps = editableSteps.filter((step) => !step.is_final);
  const finalStep = editableSteps.find((step) => step.is_final);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination || destination.index === source.index) return;

    const items = Array.from(nonFinalSteps);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);

    setEditableSteps([...items, ...(finalStep ? [finalStep] : [])]);
  };

  const handleTextChange = (index: number, newText: string) => {
    setEditableSteps((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        displayText: newText,
        hasUnsavedChanges: true,
      };
      return updated;
    });
  };

  const handleFileChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const step = nonFinalSteps[index];

      const currentImages = step.metadata?.images || [];
      const currentNewFiles = step.newImageFiles || [];
      const availableSlots =
        MAX_IMAGES_PER_COMMENT - currentImages.length - currentNewFiles.length;

      if (files.length > availableSlots) {
        toast({
          title: "Too many images selected",
          description: `You can add ${availableSlots > 0 ? `up to ${availableSlots} more` : "no more"} image(s). Max ${MAX_IMAGES_PER_COMMENT} total.`,
          variant: "warning",
        });

        if (fileInputRefs.current[`file-input-${index}`]) {
          fileInputRefs.current[`file-input-${index}`].value = "";
        }
        return;
      }

      const validFiles = files.filter((file) => {
        if (!ACCEPTED_IMAGE_TYPES_STRING.split(",").includes(file.type)) {
          toast({
            title: "Invalid File Type",
            description: `File "${file.name}" has an unsupported type. Only JPG, PNG, WebP allowed.`,
            variant: "warning",
          });
          return false;
        }
        return true;
      });

      // Add new files to step
      setEditableSteps((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          newImageFiles: [
            ...(updated[index].newImageFiles || []),
            ...validFiles,
          ],
          hasUnsavedChanges: true,
        };
        return updated;
      });

      // Reset file input
      if (fileInputRefs.current[`file-input-${index}`]) {
        fileInputRefs.current[`file-input-${index}`].value = "";
      }
    }
  };

  const removeExistingImage = (stepIndex: number, imageIndex: number) => {
    setEditableSteps((prev) => {
      const updated = [...prev];
      const step = { ...updated[stepIndex] };
      if (step.metadata?.images) {
        const newImages = [...step.metadata.images];
        newImages.splice(imageIndex, 1);
        step.metadata = {
          ...step.metadata,
          images: newImages,
        };
        step.hasUnsavedChanges = true;
        updated[stepIndex] = step;
      }
      return updated;
    });
  };

  const removeNewImage = (stepIndex: number, fileIndex: number) => {
    setEditableSteps((prev) => {
      const updated = [...prev];
      if (updated[stepIndex].newImageFiles) {
        const newFiles = [...updated[stepIndex].newImageFiles];
        newFiles.splice(fileIndex, 1);
        updated[stepIndex] = {
          ...updated[stepIndex],
          newImageFiles: newFiles,
          hasUnsavedChanges: true,
        };
      }
      return updated;
    });
  };

  const handleAddStep = () => {
    const newStep = {
      name: `Step ${nonFinalSteps.length + 1}`,
      status: "pending" as const,
      displayText: "",
      newImageFiles: [] as File[],
      hasUnsavedChanges: true,
      isSaving: false,
      metadata: {
        type: "comment" as const,
        text: "",
        images: [],
        links: [],
        created_at: new Date().toISOString(),
        comment_id: `new-${Date.now()}`,
      },
    };

    const updatedSteps = [...nonFinalSteps, newStep];
    setEditableSteps([...updatedSteps, ...(finalStep ? [finalStep] : [])]);

    toast({
      title: "Step Added",
      description: "New step added. Don't forget to save your changes.",
      variant: "success",
    });
  };

  const handleDeleteStep = (index: number) => {
    if (nonFinalSteps.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "At least one step is required in the workflow.",
        variant: "warning",
      });
      return;
    }

    const updatedSteps = [...nonFinalSteps];
    updatedSteps.splice(index, 1);
    setEditableSteps([...updatedSteps, ...(finalStep ? [finalStep] : [])]);

    toast({
      title: "Step Deleted",
      description: "The step has been removed from the workflow.",
    });
  };

  const handleSaveAllChanges = async () => {
    if (isSaving) return;

    // Check for empty steps
    const hasEmptyStep = nonFinalSteps.some(
      (step) =>
        !step.displayText?.trim() &&
        (!step.metadata?.images || step.metadata.images.length === 0) &&
        (!step.newImageFiles || step.newImageFiles.length === 0)
    );

    if (hasEmptyStep) {
      const proceed = confirm(
        "One or more steps appear to be empty. Save anyway?"
      );
      if (!proceed) return;
    }

    try {
      const allFormData = new FormData();
      allFormData.append("trackId", trackId);

      const stepsForStructure = editableSteps.map((step) => ({
        name: step.name,
        status: step.status,
        is_final: step.is_final,
        deliverable_link: step.deliverable_link,
        metadata: {
          type: step.metadata?.type || "comment",
          comment_id: step.metadata?.comment_id,
          text: step.displayText,
          images: step.metadata?.images || [],
          links: step.metadata?.links || [],
          created_at: step.metadata?.created_at,
        },
      }));

      allFormData.append("stepsStructure", JSON.stringify(stepsForStructure));

      const stepsToProcess = editableSteps
        .map((step, index) => ({
          index,
          hasNewImages: step.newImageFiles?.length > 0,
          isFinal: step.is_final,
        }))
        .filter((item) => !item.isFinal);

      allFormData.append("stepsToProcess", JSON.stringify(stepsToProcess));

      const stepsWithNewImages = stepsToProcess.filter(
        (item) => item.hasNewImages
      );

      allFormData.append(
        "stepsWithNewImages",
        JSON.stringify(stepsWithNewImages)
      );

      editableSteps.forEach((step, stepIndex) => {
        if (step.newImageFiles && step.newImageFiles.length > 0) {
          step.newImageFiles.forEach((file, fileIndex) => {
            allFormData.append(`newImage_${stepIndex}_${fileIndex}`, file);
          });
        }
      });

      await updateAllStepContent(allFormData);

      setEditableSteps((prev) =>
        prev.map((step) => ({
          ...step,
          hasUnsavedChanges: false,
          newImageFiles: [],
        }))
      );

      toast({
        title: "Success",
        description: "All changes saved successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save changes",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center pb-2 border-b">
        <h3 className="text-lg font-medium mb-2 sm:mb-0">
          Manage Workflow Steps
        </h3>
        <div className="flex items-center gap-2">
          <RevButtons
            variant="success"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleSaveAllChanges}
            disabled={isSaving || editableSteps.some((step) => step.isSaving)}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Save All Changes</span>
          </RevButtons>
          <RevButtons
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSaving || editableSteps.some((step) => step.isSaving)}
          >
            Back
          </RevButtons>
        </div>
      </div>

      {/* Draggable steps list */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={`steps-${trackId}`}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-5"
            >
              {nonFinalSteps.map((step, index) => {
                const totalImages =
                  (step.metadata?.images?.length || 0) +
                  (step.newImageFiles?.length || 0);
                const canAddMoreImages = totalImages < MAX_IMAGES_PER_COMMENT;

                return (
                  <Draggable
                    key={`step-${trackId}-${step.metadata?.comment_id || `index-${index}`}`}
                    draggableId={`step-${trackId}-${step.metadata?.comment_id || `index-${index}`}`}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`border rounded-lg p-4 ${
                          snapshot.isDragging
                            ? "bg-accent/20 border-primary"
                            : ""
                        } ${step.hasUnsavedChanges ? "border-yellow-200/50 border-2 border-dashed" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            {...provided.dragHandleProps}
                            className="p-2 cursor-grab hover:bg-accent rounded mt-2"
                          >
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                          </div>

                          <div className="flex-1 space-y-3">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-sm">
                                Step {index + 1}
                                {step.hasUnsavedChanges && " (Unsaved changes)"}
                              </h4>
                              <div className="flex gap-2">
                                <RevButtons
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => handleDeleteStep(index)}
                                  className="size-8"
                                  title="Delete step"
                                  disabled={step.isSaving}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </RevButtons>
                              </div>
                            </div>

                            <Textarea
                              value={step.displayText || ""}
                              onChange={(e) =>
                                handleTextChange(index, e.target.value)
                              }
                              placeholder="Describe this work step..."
                              className="min-h-[80px] w-full"
                              disabled={step.isSaving}
                            />

                            <div className="space-y-2">
                              <Label
                                htmlFor={`image-upload-${index}`}
                                className={`text-sm font-medium flex items-center gap-2 ${
                                  canAddMoreImages && !step.isSaving
                                    ? "text-muted-foreground cursor-pointer hover:text-primary"
                                    : "text-muted-foreground/50 cursor-not-allowed"
                                }`}
                              >
                                <ImageIcon className="h-4 w-4" />
                                Images ({totalImages}/{MAX_IMAGES_PER_COMMENT})
                              </Label>

                              <Input
                                id={`image-upload-${index}`}
                                ref={(el) =>
                                  (fileInputRefs.current[
                                    `file-input-${index}`
                                  ] = el)
                                }
                                type="file"
                                multiple
                                accept={ACCEPTED_IMAGE_TYPES_STRING}
                                onChange={(e) => handleFileChange(index, e)}
                                className="hidden"
                                disabled={!canAddMoreImages || step.isSaving}
                              />

                              <div className="flex flex-wrap gap-2 mt-2">
                                {/* Existing Images */}
                                {step.metadata?.images &&
                                  step.metadata.images.map((url, imgIndex) => (
                                    <div
                                      key={`existing-${index}-${imgIndex}`}
                                      className="relative w-20 h-20 group"
                                    >
                                      <Image
                                        src={url}
                                        alt={`Existing image ${imgIndex + 1}`}
                                        width={80}
                                        height={80}
                                        className="w-full h-full object-cover rounded border"
                                      />
                                      <RevButtons
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-0 right-0 h-5 w-5 rounded-full -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() =>
                                          removeExistingImage(index, imgIndex)
                                        }
                                        title="Remove image"
                                        disabled={step.isSaving}
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </RevButtons>
                                    </div>
                                  ))}

                                {/* New Image Previews */}
                                {step.newImageFiles &&
                                  step.newImageFiles.map((file, fileIndex) => (
                                    <div
                                      key={`new-${index}-${file.name}-${fileIndex}`}
                                      className="relative w-20 h-20 group"
                                    >
                                      <Image
                                        src={URL.createObjectURL(file)}
                                        alt={`Preview ${file.name}`}
                                        width={80}
                                        height={80}
                                        className="w-full h-full object-cover rounded border"
                                        onLoad={(e) =>
                                          URL.revokeObjectURL(
                                            e.currentTarget.src
                                          )
                                        }
                                      />
                                      <RevButtons
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-0 right-0 h-5 w-5 rounded-full -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() =>
                                          removeNewImage(index, fileIndex)
                                        }
                                        title="Remove image"
                                        disabled={step.isSaving}
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </RevButtons>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add new step button */}
      <div className="flex justify-center pt-2">
        <RevButtons
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleAddStep}
        >
          <PlusCircle className="h-4 w-4" />
          Add New Step
        </RevButtons>
      </div>
    </div>
  );
}
