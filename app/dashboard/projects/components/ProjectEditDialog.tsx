// app/dashboard/projects/components/ProjectEditDialog.tsx
"use client";

import React, { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Loader2, Lock, Eye, EyeOff, Info, AlertCircle, KeyRound } from "lucide-react";
import { updateProject } from "../../projects/actions";
import { RevButtons } from "@/components/ui/RevButtons";
import { Project } from "../../components/libs";

interface ProjectEditDialogProps {
  project: Project;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function ProjectEditDialog({
  project,
  isOpen,
  setIsOpen,
}: ProjectEditDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [isPasswordProtected, setIsPasswordProtected] = useState(project.password_protected);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const formattedDeadline = project.deadline
    ? new Date(project.deadline).toISOString().split("T")[0]
    : "";
    
  React.useEffect(() => {
    if (isOpen) {
      setIsPasswordProtected(project.password_protected);
      setPasswordInput("");
      setShowPassword(false);
    }
  }, [isOpen, project.id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (isPasswordProtected && !project.password_protected && !passwordInput.trim()) {
      toast({
        title: "Error",
        description: "Password is required when enabling protection",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData(event.currentTarget);
    
    // Add password protection state
    formData.set("password_protected", isPasswordProtected.toString());
    
    // Only include password in formData if it's been changed
    if (passwordInput.trim()) {
      formData.set("access_password", passwordInput);
    }
    
    startTransition(async () => {
      try {
        const result = await updateProject(project.id, formData);
        toast({
          title: "Success",
          description: result.message,
          variant: "success",
        });
        setIsOpen(false);
        router.refresh(); 
      } catch (error: any) {
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  const hasExistingPassword = project.password_protected;
  const isEnteringNewPassword = passwordInput.length > 0;
  const requiresNewPassword = isPasswordProtected && !project.password_protected;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-4 max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Project Details</DialogTitle>
          <DialogDescription>
            Update details for "{project.title}".
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
      
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={project.title}
              required
            />
          </div>

         
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={project.description ?? ""}
              rows={3}
              placeholder="Optional project description..."
            />
          </div>

         
          <div className="border p-4 rounded-md space-y-3">
            <h3 className="text-lg font-medium">Client Information</h3>

            <div className="space-y-2">
              <Label htmlFor="client_name">Client Name</Label>
              <Input
                id="client_name"
                name="client_name"
                defaultValue={project.client_name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_email">Client Email (Optional)</Label>
              <Input
                id="client_email"
                name="client_email"
                type="email"
                defaultValue={project.client_email ?? ""}
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
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1.5"
              >
                {isPasswordProtected && (
                  <Lock className="h-3.5 w-3.5 text-yellow-500" />
                )}
                Password Protect Project
              </label>
            </div>

            {isPasswordProtected && (
              <div className="pt-2 space-y-2">
                <div className="flex justify-between items-center">
                  <Label
                    htmlFor="access_password"
                    className="flex items-center gap-1.5"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    Project Password
                  </Label>
                  {hasExistingPassword && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-medium flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Currently password protected
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Input
                    id="access_password"
                    name="access_password"
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder={
                      hasExistingPassword
                        ? "Enter new password to change"
                        : "Enter a password"
                    }
                    className="pr-10"
                    required={requiresNewPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="text-xs text-muted-foreground mt-1 p-2 border rounded-md bg-muted/50">
                  {hasExistingPassword ? (
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {isEnteringNewPassword ? (
                          <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
                        ) : (
                          <Info className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div>
                        {isEnteringNewPassword ? (
                          <span className="font-medium text-yellow-500">
                            You are changing the password.
                          </span>
                        ) : (
                          <span>This project already has a password.</span>
                        )}
                        <br />
                        {isEnteringNewPassword
                          ? "The existing password will be replaced."
                          : "Leave this field empty to keep the current password."}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <Info className="h-3.5 w-3.5 mt-0.5" />
                      <div>
                        <span className="font-medium">Password required.</span>
                        <br />
                        Enter a password to protect this project.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Deadline Input */}
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline (Optional)</Label>
            <Input
              id="deadline"
              name="deadline"
              type="date"
              defaultValue={formattedDeadline}
            />
          </div>

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <RevButtons type="button" variant="outline" disabled={isPending}>
                Cancel
              </RevButtons>
            </DialogClose>
            <RevButtons type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </RevButtons>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}