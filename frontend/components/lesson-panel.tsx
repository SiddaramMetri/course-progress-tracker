"use client";

import { BookOpen, CheckCircle2, Circle } from "lucide-react";

import { AttachmentList } from "@/components/attachment-list";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAttachments } from "@/hooks/use-attachments";
import type { LessonOut } from "@/types";

interface LessonPanelProps {
  lesson: LessonOut;
  onToggle: (lessonId: string) => void;
  toggling: boolean;
}

export function LessonPanel({ lesson, onToggle, toggling }: LessonPanelProps) {
  const {
    attachments,
    loading: attachmentsLoading,
    uploading,
    upload,
    remove,
  } = useAttachments(lesson.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary shrink-0" />
          <h2 className="text-2xl font-semibold tracking-tight">
            {lesson.title}
          </h2>
        </div>
        {lesson.completed ? (
          <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
        ) : (
          <Circle className="h-6 w-6 text-muted-foreground shrink-0" />
        )}
      </div>

      <Separator />

      {lesson.description && (
        <p className="text-muted-foreground leading-relaxed">
          {lesson.description}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">Materials</h3>
        <AttachmentList
          attachments={attachments}
          loading={attachmentsLoading}
          onDelete={remove}
        />
        <FileUpload onUpload={upload} uploading={uploading} />
      </div>

      <div>
        <Button
          onClick={() => onToggle(lesson.id)}
          disabled={toggling}
          variant={lesson.completed ? "outline" : "default"}
          className="w-full sm:w-auto"
        >
          {toggling
            ? "Updating..."
            : lesson.completed
              ? "Mark as Incomplete"
              : "Mark as Complete"}
        </Button>
      </div>
    </div>
  );
}
