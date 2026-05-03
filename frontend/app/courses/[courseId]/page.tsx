"use client";

import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { use } from "react";

import { AppShell } from "@/components/app-shell";
import { ConfettiCelebration, fireConfettiBurst } from "@/components/confetti-celebration";
import { CourseSidebar } from "@/components/course-sidebar";
import { LessonPanel } from "@/components/lesson-panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useCourseDetail } from "@/hooks/use-course-detail";
import { useToggleLesson } from "@/hooks/use-toggle-lesson";
import type { LessonOut } from "@/types";

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { isAdmin } = useAuth();
  const { course, loading, error, refetch } = useCourseDetail(courseId);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [learnerPreview, setLearnerPreview] = useState(false);

  // Track previous completion to detect 100% transition
  const prevCompletedRef = useRef<number>(0);

  useEffect(() => {
    if (!course) return;
    const wasComplete = prevCompletedRef.current === course.total_count;
    const isNowComplete =
      course.total_count > 0 && course.completed_count === course.total_count;

    // Fire confetti only on transition TO 100%
    if (isNowComplete && !wasComplete && prevCompletedRef.current > 0) {
      setTimeout(() => fireConfettiBurst("classic"), 300);
    }

    prevCompletedRef.current = course.completed_count;
  }, [course]);

  const handleToggleSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const { toggle, toggling } = useToggleLesson(handleToggleSuccess);

  // Flatten only unlocked lessons for prev/next navigation
  const allLessons = useMemo<LessonOut[]>(() => {
    if (!course) return [];
    return course.modules
      .filter((m) => !m.is_locked)
      .flatMap((m) => m.lessons);
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

  // Redirect to explore page if no access (403)
  if (error?.includes("access") || error?.includes("403")) {
    if (typeof window !== "undefined") {
      window.location.href = `/explore/${courseId}`;
    }
    return null;
  }

  if (error || !course) {
    return (
      <AppShell>
        <div className="px-8 py-8">
          <Link
            href={isAdmin ? "/admin/courses" : "/dashboard"}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            {isAdmin ? "Back to courses" : "Back to dashboard"}
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
      <div className="flex flex-col h-[calc(100vh-3rem)]">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-3 border-b shrink-0">
          <Link
            href={isAdmin ? "/admin/courses" : "/dashboard"}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {isAdmin ? "Back to courses" : "Back to dashboard"}
          </Link>
          {isAdmin && (
            <Button
              variant={learnerPreview ? "default" : "outline"}
              size="sm"
              onClick={() => setLearnerPreview(!learnerPreview)}
              className={learnerPreview ? "bg-violet-600 hover:bg-violet-700" : ""}
            >
              {learnerPreview ? (
                <><EyeOff className="h-3.5 w-3.5 mr-1" /> Exit Preview</>
              ) : (
                <><Eye className="h-3.5 w-3.5 mr-1" /> View as Learner</>
              )}
            </Button>
          )}
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Course sidebar - independent scroll */}
          <aside className="w-72 shrink-0 border-r overflow-y-auto p-6">
            <CourseSidebar
              course={course}
              selectedLessonId={
                selectedLessonId ?? course.modules[0]?.lessons[0]?.id ?? null
              }
              onSelectLesson={handleSelectLesson}
              onRefetch={refetch}
              hideAdminControls={learnerPreview}
            />
          </aside>

          {/* Lesson content - independent scroll */}
          <div className="flex-1 min-w-0 overflow-y-auto p-8">
            {/* Course completion celebration */}
            {course.total_count > 0 &&
              course.completed_count === course.total_count && (
                <div className="mb-6 rounded-xl border border-green-200 bg-green-50/50 p-2">
                  <ConfettiCelebration
                    courseTitle={course.title}
                    variant="classic"
                    intensity={6}
                    autoTrigger={false}
                  />
                </div>
              )}

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
                hideAdminControls={learnerPreview}
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
