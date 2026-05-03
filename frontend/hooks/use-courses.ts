"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { CourseListItem } from "@/types";

export function useCourses() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.courses.all,
    queryFn: () => apiFetch<CourseListItem[]>("/courses"),
  });

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
  }, [queryClient]);

  return {
    courses: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
