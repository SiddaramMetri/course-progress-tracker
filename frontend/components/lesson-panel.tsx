"use client";

import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
} from "lucide-react";

import { AttachmentList } from "@/components/attachment-list";
import { FileUpload } from "@/components/file-upload";
import { VideoPlayer } from "@/components/video-player";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAttachments } from "@/hooks/use-attachments";
import { useAuth } from "@/hooks/use-auth";
import type { LessonOut } from "@/types";

interface LessonPanelProps {
  lesson: LessonOut;
  onToggle: (lessonId: string) => void;
  toggling: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  prevTitle?: string;
  nextTitle?: string;
  onRefetch?: () => void;
}

export function LessonPanel({
  lesson,
  onToggle,
  toggling,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  prevTitle,
  nextTitle,
  onRefetch,
}: LessonPanelProps) {
  const { isAdmin } = useAuth();
  const {
    attachments,
    loading: attachmentsLoading,
    uploading,
    upload,
    remove,
  } = useAttachments(lesson.id);

  const hasAttachments = attachments.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
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

      {/* Lesson meta */}
      {(lesson.lesson_type !== "video" || lesson.duration_minutes) && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="capitalize rounded-full bg-muted px-2.5 py-0.5 font-medium">
            {lesson.lesson_type}
          </span>
          {lesson.duration_minutes && (
            <span>{lesson.duration_minutes} min</span>
          )}
        </div>
      )}

      <Separator />

      {/* Video Player */}
      <VideoPlayer
        youtubeUrl={lesson.video_url}
        storageKey={lesson.video_storage_key}
        lessonId={lesson.id}
        onVideoChange={onRefetch}
      />

      {/* Description / Content (rendered as rich HTML) */}
      {lesson.description && (
        <div
          className="lesson-content text-muted-foreground leading-relaxed text-sm"
          dangerouslySetInnerHTML={{ __html: lesson.description }}
        />
      )}

      {/* Materials (admin: upload+delete, learner: download only) */}
      {(isAdmin || hasAttachments || attachmentsLoading) && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium">Materials</h3>
          <AttachmentList
            attachments={attachments}
            loading={attachmentsLoading}
            onDelete={isAdmin ? remove : undefined}
          />
          {isAdmin && (
            <FileUpload onUpload={upload} uploading={uploading} />
          )}
        </div>
      )}

      {/* Mark Complete / Incomplete */}
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

      <Separator />

      {/* Previous / Next Navigation */}
      <div className="flex items-center justify-between gap-4">
        <div>
          {hasPrev && (
            <Button
              variant="ghost"
              onClick={onPrev}
              className="gap-1 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{prevTitle}</span>
              <span className="sm:hidden">Previous</span>
            </Button>
          )}
        </div>
        <div>
          {hasNext && (
            <Button
              variant={lesson.completed ? "default" : "outline"}
              onClick={onNext}
              className="gap-1"
            >
              <span className="hidden sm:inline">{nextTitle}</span>
              <span className="sm:hidden">Next Lesson</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
