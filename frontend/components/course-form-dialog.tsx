"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdmin } from "@/hooks/use-admin";

interface CourseFormDialogProps {
  mode: "create" | "edit";
  courseId?: string;
  initialTitle?: string;
  initialDescription?: string;
  onSuccess: () => void;
  trigger: React.ReactNode;
}

export function CourseFormDialog({
  mode,
  courseId,
  initialTitle = "",
  initialDescription = "",
  onSuccess,
  trigger,
}: CourseFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [saving, setSaving] = useState(false);
  const admin = useAdmin();

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setTitle(initialTitle);
      setDescription(initialDescription);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      if (mode === "create") {
        await admin.createCourse({
          title: title.trim(),
          description: description.trim() || null,
        });
      } else if (courseId) {
        await admin.updateCourse(courseId, {
          title: title.trim(),
          description: description.trim() || null,
        });
      }
      setOpen(false);
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>
          {mode === "create" ? "New Course" : "Edit Course"}
        </DialogTitle>
        <DialogDescription>
          {mode === "create"
            ? "Add a new course to the platform."
            : "Update course details."}
        </DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="course-title">Title</Label>
            <Input
              id="course-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Course title"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course-desc">Description</Label>
            <Textarea
              id="course-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Course description (optional)"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={saving || !title.trim()}>
              {saving ? "Saving..." : mode === "create" ? "Create" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
