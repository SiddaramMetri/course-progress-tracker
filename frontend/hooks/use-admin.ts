"use client";

import { apiFetch } from "@/lib/api";
import type { CourseInput, LessonInput, ModuleInput } from "@/types";

export function useAdmin() {
  return {
    createCourse: (data: CourseInput) =>
      apiFetch("/courses", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    updateCourse: (id: string, data: Partial<CourseInput>) =>
      apiFetch(`/courses/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    deleteCourse: (id: string) =>
      apiFetch(`/courses/${id}`, { method: "DELETE" }),

    createModule: (courseId: string, data: ModuleInput) =>
      apiFetch(`/courses/${courseId}/modules`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    updateModule: (id: string, data: Partial<ModuleInput>) =>
      apiFetch(`/modules/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    deleteModule: (id: string) =>
      apiFetch(`/modules/${id}`, { method: "DELETE" }),

    createLesson: (moduleId: string, data: LessonInput) =>
      apiFetch(`/modules/${moduleId}/lessons`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    updateLesson: (id: string, data: Partial<LessonInput>) =>
      apiFetch(`/lessons/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    deleteLesson: (id: string) =>
      apiFetch(`/lessons/${id}`, { method: "DELETE" }),
  };
}
