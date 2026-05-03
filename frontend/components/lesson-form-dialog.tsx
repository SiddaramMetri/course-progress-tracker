"use client";

import { BookOpen, Clock, Film, FileText, Dumbbell } from "lucide-react";
import { useState } from "react";

import { RichTextEditor } from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAdmin } from "@/hooks/use-admin";

const LESSON_TYPES = [
  { value: "video", label: "Video", icon: Film },
  { value: "reading", label: "Reading", icon: FileText },
  { value: "exercise", label: "Exercise", icon: Dumbbell },
];

interface LessonFormDialogProps {
  mode: "create" | "edit";
  moduleId?: string;
  lessonId?: string;
  initialTitle?: string;
  initialDescription?: string;
  initialVideoUrl?: string;
  initialLessonType?: string;
  initialDuration?: number | null;
  initialSortOrder?: number;
  onSuccess: () => void;
  trigger: React.ReactNode;
}

export function LessonFormDialog({
  mode,
  moduleId,
  lessonId,
  initialTitle = "",
  initialDescription = "",
  initialVideoUrl = "",
  initialLessonType = "video",
  initialDuration = null,
  initialSortOrder = 0,
  onSuccess,
  trigger,
}: LessonFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const [lessonType, setLessonType] = useState(initialLessonType);
  const [duration, setDuration] = useState<number | null>(initialDuration);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);
  const [saving, setSaving] = useState(false);
  const admin = useAdmin();

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setTitle(initialTitle);
      setDescription(initialDescription);
      setVideoUrl(initialVideoUrl);
      setLessonType(initialLessonType);
      setDuration(initialDuration);
      setSortOrder(initialSortOrder);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        description: description || null,
        video_url: videoUrl.trim() || null,
        lesson_type: lessonType,
        duration_minutes: duration,
        sort_order: sortOrder,
      };
      if (mode === "create" && moduleId) {
        await admin.createLesson(moduleId, data);
      } else if (mode === "edit" && lessonId) {
        await admin.updateLesson(lessonId, data);
      }
      setOpen(false);
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetTrigger>{trigger}</SheetTrigger>
      <SheetContent side="right" className="sm:max-w-lg w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "New Lesson" : "Edit Lesson"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Add a new lesson with content, video, and materials."
              : "Update lesson details and content."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 pb-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="lesson-title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lesson-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Lesson title"
              autoFocus
            />
          </div>

          {/* Lesson Type */}
          <div className="space-y-2">
            <Label>Lesson Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {LESSON_TYPES.map((type) => {
                const Icon = type.icon;
                const isActive = lessonType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setLessonType(type.value)}
                    className={`flex flex-col items-center gap-1 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${
                      isActive
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="lesson-duration">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Duration (minutes)
              </span>
            </Label>
            <Input
              id="lesson-duration"
              type="number"
              min={0}
              value={duration ?? ""}
              onChange={(e) =>
                setDuration(e.target.value ? Number(e.target.value) : null)
              }
              placeholder="e.g. 15"
            />
          </div>

          {/* Description - Rich Text Editor */}
          <div className="space-y-2">
            <Label>
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                Content / Description
              </span>
            </Label>
            <RichTextEditor
              content={description}
              onChange={setDescription}
              placeholder="Write lesson content with formatting..."
            />
          </div>

          {/* YouTube URL */}
          <div className="space-y-2">
            <Label htmlFor="lesson-video">
              <span className="flex items-center gap-1">
                <Film className="h-3.5 w-3.5" />
                YouTube URL
              </span>
            </Label>
            <Input
              id="lesson-video"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p className="text-xs text-muted-foreground">
              Or upload a custom video after creating the lesson.
            </p>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label htmlFor="lesson-order">Sort Order</Label>
            <Input
              id="lesson-order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !title.trim()}>
              {saving ? "Saving..." : mode === "create" ? "Create Lesson" : "Save Changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
