"use client";

import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdmin } from "@/hooks/use-admin";
import { useAuth } from "@/hooks/use-auth";
import { useCourses } from "@/hooks/use-courses";

import { CourseFormDialog } from "./course-form-dialog";
import { CourseProgress } from "./course-progress";

export function CourseList() {
  const { courses, loading, error, refetch } = useCourses();
  const { user } = useAuth();
  const admin = useAdmin();
  const isAdmin = user?.role === "admin";

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-destructive font-medium">Failed to load courses</p>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">No courses available yet.</p>
      </div>
    );
  }

  const handleDelete = async (courseId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this course? This cannot be undone.")) return;
    await admin.deleteCourse(courseId);
    refetch();
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {courses.map((course) => {
        const isComplete =
          course.total_count > 0 &&
          course.completed_count === course.total_count;

        return (
          <Link key={course.id} href={`/courses/${course.id}`}>
            <Card className="h-full transition-colors hover:border-primary/50 hover:shadow-md cursor-pointer relative group">
              {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CourseFormDialog
                    mode="edit"
                    courseId={course.id}
                    initialTitle={course.title}
                    initialDescription={course.description ?? ""}
                    onSuccess={refetch}
                    trigger={
                      <span
                        className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted cursor-pointer"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </span>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={(e) => handleDelete(course.id, e)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  {isComplete && (
                    <Badge variant="default" className="shrink-0">
                      Completed
                    </Badge>
                  )}
                </div>
                {course.description && (
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <CourseProgress
                  completed={course.completed_count}
                  total={course.total_count}
                />
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
