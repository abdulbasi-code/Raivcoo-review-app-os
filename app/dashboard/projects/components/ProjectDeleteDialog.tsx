// app/projects/ProjectDeleteDialog.tsx

"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { deleteProject } from "../actions";
import { RevButtons } from "@/components/ui/RevButtons";

interface ProjectDeleteDialogProps {
  projectId: string;
  projectTitle: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function ProjectDeleteDialog({
  projectId,
  projectTitle,
  isOpen,
  setIsOpen,
}: ProjectDeleteDialogProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteProject(projectId);
        toast({
          title: "Success",
          description: result.message,
          variant: "success",
        });
        setIsOpen(false);
        router.refresh();
      } catch (error: any) {
        toast({
          title: "Deletion Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsOpen(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Project?</DialogTitle>
          <DialogDescription>
            Permanently delete project{" "}
            <strong className="mx-1">"{projectTitle}"</strong> and all its data?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <RevButtons
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isPending}
          >
            Cancel
          </RevButtons>
          <RevButtons
            onClick={handleDelete}
            disabled={isPending}
            variant="destructive"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Yes, Delete
          </RevButtons>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}