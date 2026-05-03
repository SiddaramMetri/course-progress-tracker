export interface CourseListItem {
  id: string;
  title: string;
  description: string | null;
  completed_count: number;
  total_count: number;
}

export interface LessonOut {
  id: string;
  title: string;
  description: string | null;
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
