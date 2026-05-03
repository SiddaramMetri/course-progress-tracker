"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { use } from "react";

import { AppShell } from "@/components/app-shell";
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

  // Flatten all lessons across modules for prev/next navigation
  const allLessons = useMemo<LessonOut[]>(() => {
    if (!course) return [];
    return course.modules.flatMap((m) => m.lessons);
  }, [course]);

  const selectedLesson = useMemo<LessonOut | null>(() => {
    if (!course) return null;
    if (selectedLessonId) {
      const found = allLessons.find((l) => l.id === selectedLessonId);
      if (found) return found;
    }
    return allLessons[0] ?? null;
  }, [course, selectedLessonId, allLessons]);

  const currentIndex = useMemo(() => {
    if (!selectedLesson) return -1;
    return allLessons.findIndex((l) => l.id === selectedLesson.id);
  }, [selectedLesson, allLessons]);

  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;

  const handleSelectLesson = useCallback((lesson: LessonOut) => {
    setSelectedLessonId(lesson.id);
  }, []);

  const handlePrev = useCallback(() => {
    if (prevLesson) setSelectedLessonId(prevLesson.id);
  }, [prevLesson]);

  const handleNext = useCallback(() => {
    if (nextLesson) setSelectedLessonId(nextLesson.id);
  }, [nextLesson]);

  if (loading) {
    return (
      <AppShell>
        <div className="px-8 py-8">
          <Skeleton className="h-5 w-32 mb-6" />
          <div className="flex gap-8">
            <div className="w-72 shrink-0">
              <Skeleton className="h-5 w-48 mb-4" />
              <Skeleton className="h-2 w-full mb-6" />
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full mb-2" />
              ))}
            </div>
            <div className="flex-1">
              <Skeleton className="h-7 w-64 mb-4" />
              <Skeleton className="aspect-video w-full mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !course) {
    return (
      <AppShell>
        <div className="px-8 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
            <p className="text-destructive font-medium">
              {error || "Course not found"}
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="flex gap-8">
          {/* Course sidebar */}
          <aside className="w-72 shrink-0 border-r pr-6">
            <CourseSidebar
              course={course}
              selectedLessonId={
                selectedLessonId ?? course.modules[0]?.lessons[0]?.id ?? null
              }
              onSelectLesson={handleSelectLesson}
              onRefetch={refetch}
            />
          </aside>

          {/* Lesson content */}
          <div className="flex-1 min-w-0">
            {selectedLesson ? (
              <LessonPanel
                lesson={selectedLesson}
                onToggle={toggle}
                toggling={toggling}
                onPrev={handlePrev}
                onNext={handleNext}
                hasPrev={!!prevLesson}
                hasNext={!!nextLesson}
                prevTitle={prevLesson?.title}
                nextTitle={nextLesson?.title}
                onRefetch={refetch}
              />
            ) : (
              <div className="rounded-lg border border-dashed p-12 text-center">
                <p className="text-muted-foreground">
                  Select a lesson to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
