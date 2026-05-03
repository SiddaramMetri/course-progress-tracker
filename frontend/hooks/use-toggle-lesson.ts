"use client";

import { useCallback, useState } from "react";

import { apiFetch } from "@/lib/api";
import type { ProgressToggleResponse } from "@/types";

export function useToggleLesson(onSuccess?: () => void) {
  const [toggling, setToggling] = useState(false);

  const toggle = useCallback(
    async (lessonId: string) => {
      setToggling(true);
      try {
        await apiFetch<ProgressToggleResponse>(
          `/progress/${lessonId}/toggle`,
          { method: "POST" }
        );
        onSuccess?.();
      } finally {
        setToggling(false);
      }
    },
    [onSuccess]
  );

  return { toggle, toggling };
}
