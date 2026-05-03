"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { ProgressToggleResponse } from "@/types";

export function useToggleLesson(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (lessonId: string) =>
      apiFetch<ProgressToggleResponse>(`/progress/${lessonId}/toggle`, {
        method: "POST",
      }),
    onSuccess: () => {
      // Invalidate course data to refresh progress
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
      onSuccess?.();
    },
  });

  return {
    toggle: mutation.mutateAsync,
    toggling: mutation.isPending,
  };
}
