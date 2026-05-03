"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { apiFetch, apiUpload } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { AttachmentOut } from "@/types";

export function useAttachments(lessonId: string | null) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.attachments.byLesson(lessonId ?? ""),
    queryFn: () => apiFetch<AttachmentOut[]>(`/lessons/${lessonId}/attachments`),
    enabled: !!lessonId,
  });

  const invalidate = useCallback(() => {
    if (lessonId) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.attachments.byLesson(lessonId),
      });
    }
  }, [queryClient, lessonId]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File): Promise<void> => {
      await apiUpload(`/lessons/${lessonId}/attachments`, file);
    },
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: async (attachmentId: string): Promise<void> => {
      await apiFetch(`/lessons/attachments/${attachmentId}`, {
        method: "DELETE",
      });
    },
    onSuccess: invalidate,
  });

  return {
    attachments: data ?? [],
    loading: isLoading,
    uploading: uploadMutation.isPending,
    upload: uploadMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
    refetch: invalidate,
  };
}
