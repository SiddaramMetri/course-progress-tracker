"use client";

import { useCallback, useEffect, useState } from "react";

import { apiFetch, apiUpload } from "@/lib/api";
import type { AttachmentOut } from "@/types";

export function useAttachments(lessonId: string | null) {
  const [attachments, setAttachments] = useState<AttachmentOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchAttachments = useCallback(async () => {
    if (!lessonId) return;
    setLoading(true);
    try {
      const data = await apiFetch<AttachmentOut[]>(
        `/lessons/${lessonId}/attachments`
      );
      setAttachments(data);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  const upload = useCallback(
    async (file: File) => {
      if (!lessonId) return;
      setUploading(true);
      try {
        await apiUpload(`/lessons/${lessonId}/attachments`, file);
        await fetchAttachments();
      } finally {
        setUploading(false);
      }
    },
    [lessonId, fetchAttachments]
  );

  const remove = useCallback(
    async (attachmentId: string) => {
      await apiFetch(`/lessons/attachments/${attachmentId}`, {
        method: "DELETE",
      });
      await fetchAttachments();
    },
    [fetchAttachments]
  );

  return {
    attachments,
    loading,
    uploading,
    upload,
    remove,
    refetch: fetchAttachments,
  };
}
