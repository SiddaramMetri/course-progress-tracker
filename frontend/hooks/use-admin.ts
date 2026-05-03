"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { CourseInput, LessonInput, ModuleInput } from "@/types";

export function useAdmin() {
  const queryClient = useQueryClient();

  const invalidateCourses = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
  }, [queryClient]);

  return {
    createCourse: async (data: CourseInput) => {
      const result = await apiFetch("/courses", {
        method: "POST",
        body: JSON.stringify(data),
      });
      invalidateCourses();
      return result;
    },

    updateCourse: async (id: string, data: Partial<CourseInput>) => {
      const result = await apiFetch(`/courses/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      invalidateCourses();
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.detail(id) });
      return result;
    },

    deleteCourse: async (id: string) => {
      await apiFetch(`/courses/${id}`, { method: "DELETE" });
      invalidateCourses();
    },

    createModule: async (courseId: string, data: ModuleInput) => {
      const result = await apiFetch(`/courses/${courseId}/modules`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.detail(courseId),
      });
      return result;
    },

    updateModule: async (id: string, data: Partial<ModuleInput>) => {
      const result = await apiFetch(`/modules/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      // Invalidate all course details since we don't know which course
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      return result;
    },

    deleteModule: async (id: string) => {
      await apiFetch(`/modules/${id}`, { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },

    createLesson: async (moduleId: string, data: LessonInput) => {
      const result = await apiFetch(`/modules/${moduleId}/lessons`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      return result;
    },

    updateLesson: async (id: string, data: Partial<LessonInput>) => {
      const result = await apiFetch(`/lessons/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      return result;
    },

    deleteLesson: async (id: string) => {
      await apiFetch(`/lessons/${id}`, { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  };
}
