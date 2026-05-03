"use client";

import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

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
import { apiUpload } from "@/lib/api";

interface CourseFormDialogProps {
  mode: "create" | "edit";
  courseId?: string;
  initialTitle?: string;
  initialDescription?: string;
  initialCoverUrl?: string;
  initialIsFree?: boolean;
  onSuccess: () => void;
  trigger: React.ReactNode;
}

export function CourseFormDialog({
  mode,
  courseId,
  initialTitle = "",
  initialDescription = "",
  initialCoverUrl,
  initialIsFree = false,
  onSuccess,
  trigger,
}: CourseFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [isFree, setIsFree] = useState(initialIsFree);
  const [saving, setSaving] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    initialCoverUrl ?? null
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const admin = useAdmin();

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setTitle(initialTitle);
      setDescription(initialDescription);
      setIsFree(initialIsFree);
      setCoverFile(null);
      setCoverPreview(initialCoverUrl ?? null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5 MB");
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!title.trim()) return;
    setSaving(true);
    try {
      let newCourseId = courseId;

      if (mode === "create") {
        const result = await admin.createCourse({
          title: title.trim(),
          description: description.trim() || null,
          is_free: isFree,
        });
        newCourseId = (result as { id: string }).id;
      } else if (courseId) {
        await admin.updateCourse(courseId, {
          title: title.trim(),
          description: description.trim() || null,
          is_free: isFree,
        });
      }

      // Upload cover image if selected
      if (coverFile && newCourseId) {
        setUploading(true);
        try {
          await apiUpload(`/courses/${newCourseId}/cover`, coverFile);
        } catch {
          toast.error("Course saved but cover image upload failed");
        }
        setUploading(false);
      }

      setOpen(false);
      toast.success(mode === "create" ? "Course created" : "Course updated");
      onSuccess();
    } catch {
      toast.error("Failed to save course");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
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

          {/* Free/Premium toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Free Course</p>
              <p className="text-xs text-muted-foreground">
                Free courses are accessible to all learners without batch assignment.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFree(!isFree)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                isFree ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  isFree ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label>Cover Image</Label>
            {coverPreview ? (
              <div className="relative rounded-lg overflow-hidden border">
                <Image
                  src={coverPreview}
                  alt="Cover preview"
                  width={400}
                  height={160}
                  className="w-full h-40 object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={removeCover}
                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors cursor-pointer"
              >
                <ImagePlus className="h-8 w-8" />
                <span className="text-xs">
                  Click to upload cover image (max 5 MB)
                </span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {coverPreview && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => fileInputRef.current?.click()}
              >
                Change Image
              </Button>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              type="submit"
              disabled={saving || uploading || !title.trim()}
            >
              {uploading
                ? "Uploading..."
                : saving
                  ? "Saving..."
                  : mode === "create"
                    ? "Create"
                    : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
