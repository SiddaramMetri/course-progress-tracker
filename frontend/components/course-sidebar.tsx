"use client";

import { CheckCircle2, Circle, Lock, Pencil, Plus, Trash2 } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { useAdmin } from "@/hooks/use-admin";
import { useAuth } from "@/hooks/use-auth";
import { useConfirm } from "@/hooks/use-confirm";
import type { CourseDetail, LessonOut } from "@/types";

import { CourseProgress } from "./course-progress";
import { LessonFormDialog } from "./lesson-form-dialog";
import { ModuleFormDialog } from "./module-form-dialog";
import { ModuleProgress } from "./module-progress";

interface CourseSidebarProps {
  course: CourseDetail;
  selectedLessonId: string | null;
  onSelectLesson: (lesson: LessonOut) => void;
  onRefetch: () => void;
  hideAdminControls?: boolean;
}

export function CourseSidebar({
  course,
  selectedLessonId,
  onSelectLesson,
  onRefetch,
  hideAdminControls = false,
}: CourseSidebarProps) {
  const { isAdmin: rawIsAdmin } = useAuth();
  const isAdmin = rawIsAdmin && !hideAdminControls;
  const admin = useAdmin();
  const confirm = useConfirm();

  const handleDeleteModule = async (moduleId: string) => {
    if (!(await confirm("Delete this module and all its lessons?"))) return;
    try {
      await admin.deleteModule(moduleId);
      toast.success("Module deleted");
      onRefetch();
    } catch {
      toast.error("Failed to delete module");
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!(await confirm("Delete this lesson?"))) return;
    try {
      await admin.deleteLesson(lessonId);
      toast.success("Lesson deleted");
      onRefetch();
    } catch {
      toast.error("Failed to delete lesson");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">{course.title}</h2>
        <div className="mt-2">
          <CourseProgress
            completed={course.completed_count}
            total={course.total_count}
            size="sm"
          />
        </div>
      </div>

      <Accordion
        multiple
        defaultValue={course.modules.filter((m) => !m.is_locked).map((m) => m.id)}
        className="w-full"
      >
        {course.modules.map((module) => (
          <AccordionItem key={module.id} value={module.id}>
            <AccordionTrigger className="text-sm font-medium hover:no-underline">
              <div className="flex flex-col items-start gap-1 text-left flex-1">
                <div className="flex items-center gap-1 w-full">
                  {module.is_locked && (
                    <Lock className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                  )}
                  <span className={`flex-1 ${module.is_locked ? "text-muted-foreground" : ""}`}>
                    {module.title}
                  </span>
                  {isAdmin && !module.is_locked && (
                    <span
                      className="flex gap-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ModuleFormDialog
                        mode="edit"
                        moduleId={module.id}
                        initialTitle={module.title}
                        initialSortOrder={module.sort_order}
                        onSuccess={onRefetch}
                        trigger={
                          <span className="p-0.5 rounded hover:bg-muted cursor-pointer inline-flex">
                            <Pencil className="h-3 w-3 text-muted-foreground" />
                          </span>
                        }
                      />
                      <span
                        className="p-0.5 rounded hover:bg-muted cursor-pointer inline-flex"
                        onClick={() => handleDeleteModule(module.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </span>
                    </span>
                  )}
                </div>
                {module.is_locked ? (
                  <span className="text-xs text-orange-500">
                    Unlocks {module.unlock_date}
                  </span>
                ) : (
                  <ModuleProgress
                    completed={module.completed_count}
                    total={module.total_count}
                  />
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {module.is_locked ? (
                <div className="relative">
                  <ul className="flex flex-col gap-1 opacity-50 select-none">
                    {module.lessons.map((lesson) => (
                      <li key={lesson.id}>
                        <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground cursor-not-allowed">
                          <Lock className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                          <span className="truncate flex-1">{lesson.title}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {module.lessons.length === 0 && (
                    <div className="flex flex-col items-center gap-1 py-3 text-center">
                      <Lock className="h-4 w-4 text-orange-400" />
                      <p className="text-xs text-muted-foreground">
                        Content locked
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <ul className="flex flex-col gap-1">
                    {module.lessons.map((lesson) => {
                      const isSelected = lesson.id === selectedLessonId;

                      return (
                        <li key={lesson.id} className="flex items-center group/lesson">
                          <button
                            onClick={() => onSelectLesson(lesson)}
                            className={`flex flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors text-left ${
                              isSelected
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-muted"
                            }`}
                          >
                            {lesson.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <span className="truncate flex-1">{lesson.title}</span>
                          </button>
                          {isAdmin && (
                            <span className="flex gap-0.5 opacity-0 group-hover/lesson:opacity-100 transition-opacity pr-1">
                              <LessonFormDialog
                                mode="edit"
                                lessonId={lesson.id}
                                initialTitle={lesson.title}
                                initialDescription={lesson.description ?? ""}
                                initialVideoUrl={lesson.video_url ?? ""}
                                initialLessonType={lesson.lesson_type}
                                initialDuration={lesson.duration_minutes}
                                initialSortOrder={lesson.sort_order}
                                onSuccess={onRefetch}
                                trigger={
                                  <span className="p-0.5 rounded hover:bg-muted cursor-pointer inline-flex">
                                    <Pencil className="h-3 w-3 text-muted-foreground" />
                                  </span>
                                }
                              />
                              <span
                                className="p-0.5 rounded hover:bg-muted cursor-pointer inline-flex"
                                onClick={() => handleDeleteLesson(lesson.id)}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </span>
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
              {isAdmin && (
                <LessonFormDialog
                  mode="create"
                  moduleId={module.id}
                  onSuccess={onRefetch}
                  trigger={
                    <span className="flex w-full items-center justify-center gap-1 mt-1 py-1 text-xs text-muted-foreground rounded-md hover:bg-muted cursor-pointer">
                      <Plus className="h-3 w-3" />
                      Add Lesson
                    </span>
                  }
                />
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {isAdmin && (
        <ModuleFormDialog
          mode="create"
          courseId={course.id}
          onSuccess={onRefetch}
          trigger={
            <span className="flex w-full items-center justify-center gap-1 rounded-md border py-1.5 text-sm font-medium hover:bg-muted cursor-pointer">
              <Plus className="h-4 w-4" />
              Add Module
            </span>
          }
        />
      )}
    </div>
  );
}
