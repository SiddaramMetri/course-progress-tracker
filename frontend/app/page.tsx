"use client";

import { Plus } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { CourseFormDialog } from "@/components/course-form-dialog";
import { CourseList } from "@/components/course-list";
import { AdminOnly } from "@/components/require-role";
import { useCourses } from "@/hooks/use-courses";

export default function Home() {
  const { refetch } = useCourses();

  return (
    <AppShell>
      <div className="px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track your learning progress across all courses.
            </p>
          </div>
          <AdminOnly>
            <CourseFormDialog
              mode="create"
              onSuccess={refetch}
              trigger={
                <span className="inline-flex items-center justify-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer">
                  <Plus className="h-4 w-4" />
                  New Course
                </span>
              }
            />
          </AdminOnly>
        </div>
        <CourseList />
      </div>
    </AppShell>
  );
}
