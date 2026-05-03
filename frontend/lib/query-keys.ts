/**
 * Centralized query key factory for TanStack Query.
 * Ensures consistent cache invalidation across the app.
 */
export const queryKeys = {
  courses: {
    all: ["courses"] as const,
    detail: (id: string) => ["courses", id] as const,
  },
  attachments: {
    byLesson: (lessonId: string) => ["attachments", lessonId] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    unreadCount: ["notifications", "unread-count"] as const,
  },
  admin: {
    users: ["admin", "users"] as const,
    batches: ["admin", "batches"] as const,
    batchDetail: (id: string) => ["admin", "batches", id] as const,
  },
};
