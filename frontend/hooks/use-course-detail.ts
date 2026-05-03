"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { CourseDetail } from "@/types";

export function useCourseDetail(courseId: string) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.courses.detail(courseId),
    queryFn: () => apiFetch<CourseDetail>(`/courses/${courseId}`),
    enabled: !!courseId,
  });

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.courses.detail(courseId),
    });
    // Also invalidate the course list (progress may have changed)
    queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
  }, [queryClient, courseId]);

  return {
    course: data ?? null,
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
