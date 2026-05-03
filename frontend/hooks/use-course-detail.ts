"use client";

import { useCallback, useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import type { CourseDetail } from "@/types";

export function useCourseDetail(courseId: string) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<CourseDetail>(`/courses/${courseId}`);
      setCourse(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load course details"
      );
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { course, loading, error, refetch: fetch };
}
