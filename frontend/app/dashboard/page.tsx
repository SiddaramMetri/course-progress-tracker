"use client";

import { BookOpen, ExternalLink, Plus, Sparkles } from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { CourseFormDialog } from "@/components/course-form-dialog";
import { CourseList } from "@/components/course-list";
import { AdminOnly } from "@/components/require-role";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCourses } from "@/hooks/use-courses";

export default function DashboardPage() {
  const { refetch, courses } = useCourses();
  const { user, isAdmin, isLearner } = useAuth();

  const hasBatch = !!user?.batch_name;

  return (
    <AppShell>
      <div className="px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track your learning progress across all courses.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Browse All Courses
              </Button>
            </Link>
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
        </div>

        {/* Banner for learners without batch */}
        {isLearner && !hasBatch && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 mb-6 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Want access to premium courses?
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                You currently have access to free courses only. Browse our
                premium courses and request access - an admin will review and
                assign you to a batch.
              </p>
              <Link href="/#courses" className="inline-block mt-2">
                <Button variant="outline" size="sm" className="h-7 text-xs border-blue-300 text-blue-700 hover:bg-blue-100">
                  <BookOpen className="h-3 w-3 mr-1" />
                  Explore Premium Courses
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Course list */}
        {courses.length === 0 && !isAdmin ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="font-medium mb-1">No courses yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              {hasBatch
                ? "Your batch courses will appear here once published."
                : "Browse our course catalog to find free courses."}
            </p>
            <Link href="/">
              <Button variant="outline">Browse Courses</Button>
            </Link>
          </div>
        ) : (
          <CourseList />
        )}
      </div>
    </AppShell>
  );
}
