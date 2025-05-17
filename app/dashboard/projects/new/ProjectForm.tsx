// app/projects/ProjectForm.tsx
// @ts-nocheck
"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RevButtons } from "@/components/ui/RevButtons";
import {
  Loader2,
  Plus,
  X,
  Image as ImageIcon,
  XCircle,
  GripVertical,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const MAX_IMAGES_PER_COMMENT = 4;
const ACCEPTED_IMAGE_TYPES_STRING = "image/jpeg,image/png,image/webp";

interface ProjectFormProps {
  createProject: (
    formData: FormData
  ) => Promise<{ message: string; project: any }>;
}

export default function ProjectForm({ createProject }: ProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [comments, setComments] = useState<{ text: string; images?: File[] }[]>(
    [{ text: "" }]
  );
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const router = useRouter();
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const addComment = () => {
    setComments([...comments, { text: "" }]);
  };

  const removeComment = (index: number) => {
    if (comments.length <= 1) return;
    setComments(comments.filter((_, i) => i !== index));
  };

  const updateComment = (index: number, text: string) => {
    const newComments = [...comments];
    newComments[index].text = text;
    setComments(newComments);
  };

  const handleFileChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const totalFiles = (comments[index].images?.length || 0) + files.length;

      if (totalFiles > MAX_IMAGES_PER_COMMENT) {
        toast({
          title: "Too many images",
          description: `You can only select up to ${MAX_IMAGES_PER_COMMENT} images per comment.`,
          variant: "warning",
        });
        return;
      }

      const newComments = [...comments];
      newComments[index].images = [
        ...(newComments[index].images || []),
        ...files,
      ];
      setComments(newComments);
    }
  };

  const removeImage = (commentIndex: number, imageIndex: number) => {
    const newComments = [...comments];
    newComments[commentIndex].images = newComments[commentIndex].images?.filter(
      (_, i) => i !== imageIndex
    );
    setComments(newComments);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(comments);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setComments(items);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validComments = comments.filter(
      (c) => c.text.trim() !== "" || (c.images && c.images.length > 0)
    );
    if (validComments.length === 0) {
      toast({
        title: "Error",
        description: "At least one work step with text or image is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();

    formData.set("title", e.currentTarget.title.value);
    formData.set("description", e.currentTarget.description.value);

    formData.set("client_name", e.currentTarget.client_name.value);
    formData.set("client_email", e.currentTarget.client_email.value);

    formData.set("password_protected", isPasswordProtected.toString());
    if (isPasswordProtected) {
      formData.set("access_password", e.currentTarget.access_password.value);
    }

    if (e.currentTarget.deadline.value) {
      formData.set("deadline", e.currentTarget.deadline.value);
    }

    formData.set(
      "comments",
      JSON.stringify(
        validComments.map((c) => ({
          text: c.text,
          images: c.images?.map((f) => f.name) || [],
        }))
      )
    );

    validComments.forEach((comment, index) => {
      comment.images?.forEach((file, fileIndex) => {
        formData.append(`image_${index}_${fileIndex}`, file);
      });
    });

    try {
      const result = await createProject(formData);
      toast({
        title: "Success",
        description: result.message,
        variant: "success",
      });
      router.push(`/dashboard/projects/${result.project.id}`);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Project Title</Label>
              <Input name="title" placeholder="Project title" required />
            </div>

            <div>
              <Label>Description (Optional)</Label>
              <Textarea
                name="description"
                placeholder="Project description"
                rows={3}
              />
            </div>

            {/* Client Information Section */}
            <div className="border p-4 rounded-md space-y-3">
              <h3 className="text-lg font-medium">Client Information</h3>

              <div>
                <Label>Client Name</Label>
                <Input name="client_name" placeholder="Client name" required />
              </div>

              <div>
                <Label>Client Email (Optional)</Label>
                <Input
                  name="client_email"
                  type="email"
                  placeholder="client@example.com"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="password-protection"
                  checked={isPasswordProtected}
                  onCheckedChange={(checked) =>
                    setIsPasswordProtected(checked === true)
                  }
                />
                <label
                  htmlFor="password-protection"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Password Protect Project
                </label>
              </div>

              {isPasswordProtected && (
                <div className="pt-2">
                  <Label>Access Password</Label>
                  <Input
                    name="access_password"
                    type="password"
                    placeholder="Set access password"
                    required={isPasswordProtected}
                  />
                </div>
              )}
            </div>

            <div>
              <Label>Deadline (Optional)</Label>
              <Input name="deadline" type="date" />
            </div>

            <div className="space-y-4 pt-4">
              <Label>Work Steps</Label>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="comments">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-6"
                    >
                      {comments.map((comment, index) => (
                        <Draggable
                          key={index}
                          draggableId={`comment-${index}`}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="relative"
                            >
                              <div className="absolute left-4 top-4 flex items-center gap-1.5">
                                <div
                                  {...provided.dragHandleProps}
                                  className="p-1 rounded hover:bg-accent cursor-grab"
                                >
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </div>

                              <div className="rounded-lg p-4 space-y-3 border-[2px] bg-background border-dashed pl-12">
                                <div className="flex justify-between items-start gap-2">
                                  <Textarea
                                    value={comment.text}
                                    onChange={(e) =>
                                      updateComment(index, e.target.value)
                                    }
                                    placeholder="Describe this work step..."
                                    className="flex-1 min-h-[80px]"
                                  />
                                  <RevButtons
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeComment(index)}
                                    disabled={comments.length <= 1}
                                    className="ml-2"
                                  >
                                    <X className="h-4 w-4" />
                                  </RevButtons>
                                </div>
                                <div className="space-y-2">
                                  <label
                                    htmlFor={`image-upload-${index}`}
                                    className="text-sm font-medium text-muted-foreground flex items-center gap-2 cursor-pointer hover:text-primary"
                                  >
                                    <ImageIcon className="h-4 w-4" /> Add
                                    Reference Images (Optional)
                                  </label>
                                  <Input
                                    id={`image-upload-${index}`}
                                    ref={(el) =>
                                      (fileInputRefs.current[index] = el)
                                    }
                                    type="file"
                                    multiple
                                    accept={ACCEPTED_IMAGE_TYPES_STRING}
                                    onChange={(e) => handleFileChange(index, e)}
                                    className="hidden"
                                    disabled={
                                      (comment.images?.length || 0) >=
                                      MAX_IMAGES_PER_COMMENT
                                    }
                                  />

                                  {comment.images &&
                                    comment.images.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {comment.images.map(
                                          (file, imgIndex) => (
                                            <div
                                              key={imgIndex}
                                              className="relative w-20 h-20"
                                            >
                                              <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Preview ${imgIndex + 1}`}
                                                className="w-full h-full object-cover rounded border"
                                              />
                                              <RevButtons
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-0 right-0 h-5 w-5 rounded-full -mt-1 -mr-1"
                                                onClick={() =>
                                                  removeImage(index, imgIndex)
                                                }
                                                title="Remove image"
                                              >
                                                <XCircle className="h-4 w-4" />
                                              </RevButtons>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              <RevButtons
                type="button"
                variant="outline"
                onClick={addComment}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Work Step
              </RevButtons>
            </div>
          </div>

          <RevButtons
            type="submit"
            variant="success"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Project...
              </>
            ) : (
              "Create Project with Work Steps"
            )}
          </RevButtons>
        </form>
      </CardContent>
    </Card>
  );
}
