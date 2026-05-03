export interface CourseListItem {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  is_free: boolean;
  completed_count: number;
  total_count: number;
}

export interface LessonOut {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  video_storage_key: string | null;
  lesson_type: string;
  duration_minutes: number | null;
  sort_order: number;
  completed: boolean;
}

export interface ModuleOut {
  id: string;
  title: string;
  sort_order: number;
  lessons: LessonOut[];
  completed_count: number;
  total_count: number;
  is_locked: boolean;
  unlock_date: string | null;
}

export interface CourseDetail {
  id: string;
  title: string;
  description: string | null;
  modules: ModuleOut[];
  completed_count: number;
  total_count: number;
}

export interface ProgressToggleResponse {
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
}

// --- Admin input types ---

export interface CourseInput {
  title: string;
  description?: string | null;
  is_free?: boolean;
}

export interface ModuleInput {
  title: string;
  sort_order?: number;
}

export interface LessonInput {
  title: string;
  description?: string | null;
  video_url?: string | null;
  lesson_type?: string;
  duration_minutes?: number | null;
  sort_order?: number;
}

export interface AttachmentOut {
  id: string;
  lesson_id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  uploaded_at: string;
  download_url: string;
}
