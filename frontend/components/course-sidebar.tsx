"use client";

import { CheckCircle2, Circle } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { CourseDetail, LessonOut } from "@/types";

import { CourseProgress } from "./course-progress";
import { ModuleProgress } from "./module-progress";

interface CourseSidebarProps {
  course: CourseDetail;
  selectedLessonId: string | null;
  onSelectLesson: (lesson: LessonOut) => void;
}

export function CourseSidebar({
  course,
  selectedLessonId,
  onSelectLesson,
}: CourseSidebarProps) {
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
        defaultValue={course.modules.map((m) => m.id)}
        className="w-full"
      >
        {course.modules.map((module) => (
          <AccordionItem key={module.id} value={module.id}>
            <AccordionTrigger className="text-sm font-medium hover:no-underline">
              <div className="flex flex-col items-start gap-1 text-left">
                <span>{module.title}</span>
                <ModuleProgress
                  completed={module.completed_count}
                  total={module.total_count}
                />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="flex flex-col gap-1">
                {module.lessons.map((lesson) => {
                  const isSelected = lesson.id === selectedLessonId;

                  return (
                    <li key={lesson.id}>
                      <button
                        onClick={() => onSelectLesson(lesson)}
                        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors text-left ${
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
                        <span className="truncate">{lesson.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
