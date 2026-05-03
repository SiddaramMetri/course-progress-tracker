"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { use } from "react";

import { CourseSidebar } from "@/components/course-sidebar";
import { LessonPanel } from "@/components/lesson-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourseDetail } from "@/hooks/use-course-detail";
import { useToggleLesson } from "@/hooks/use-toggle-lesson";
import type { LessonOut } from "@/types";

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { course, loading, error, refetch } = useCourseDetail(courseId);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const handleToggleSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const { toggle, toggling } = useToggleLesson(handleToggleSuccess);

  const selectedLesson = useMemo<LessonOut | null>(() => {
    if (!course) return null;

    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (lesson.id === selectedLessonId) return lesson;
      }
    }

    // Default to first lesson if none selected
    const firstLesson = course.modules[0]?.lessons[0];
    return firstLesson ?? null;
  }, [course, selectedLessonId]);

  const handleSelectLesson = useCallback((lesson: LessonOut) => {
    setSelectedLessonId(lesson.id);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <Skeleton className="h-6 w-32 mb-8" />
          <div className="flex gap-8">
            <div className="w-80 shrink-0">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-3 w-full mb-6" />
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full mb-2" />
              ))}
            </div>
            <div className="flex-1">
              <Skeleton className="h-8 w-64 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to courses
          </Link>
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
            <p className="text-destructive font-medium">
              {error || "Course not found"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </Link>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-80 shrink-0 border-r pr-6">
            <CourseSidebar
              course={course}
              selectedLessonId={
                selectedLessonId ?? course.modules[0]?.lessons[0]?.id ?? null
              }
              onSelectLesson={handleSelectLesson}
            />
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {selectedLesson ? (
              <LessonPanel
                lesson={selectedLesson}
                onToggle={toggle}
                toggling={toggling}
              />
            ) : (
              <div className="rounded-lg border border-dashed p-12 text-center">
                <p className="text-muted-foreground">
                  Select a lesson to get started.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
