"use client";

import { BookOpen, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import { useAdmin } from "@/hooks/use-admin";
import { useAuth } from "@/hooks/use-auth";
import { useConfirm } from "@/hooks/use-confirm";
import { useCourses } from "@/hooks/use-courses";

import { CourseFormDialog } from "./course-form-dialog";

export function CourseList({ hideAdminControls = false }: { hideAdminControls?: boolean }) {
  const { courses, loading, error, refetch } = useCourses();
  const { isAdmin: rawIsAdmin } = useAuth();
  const isAdmin = rawIsAdmin && !hideAdminControls;
  const admin = useAdmin();
  const confirm = useConfirm();

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border overflow-hidden">
            <Skeleton className="h-40 w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full mt-3" />
            </div>
          </div>
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
        <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No courses available yet.</p>
      </div>
    );
  }

  const handleDelete = async (courseId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!(await confirm("Delete this course? This cannot be undone."))) return;
    try {
      await admin.deleteCourse(courseId);
      toast.success("Course deleted");
      refetch();
    } catch {
      toast.error("Failed to delete course");
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => {
        const pct =
          course.total_count > 0
            ? Math.round(
                (course.completed_count / course.total_count) * 100
              )
            : 0;
        const isComplete = pct === 100 && course.total_count > 0;

        return (
          <Link key={course.id} href={`/courses/${course.id}`}>
            <div className="rounded-xl border overflow-hidden transition-all hover:shadow-lg hover:border-primary/30 cursor-pointer group relative h-full flex flex-col">
              {/* Cover Image */}
              <div className="relative h-40 bg-gradient-to-br from-primary/20 via-primary/10 to-muted overflow-hidden">
                {course.cover_image_url ? (
                  <Image
                    src={course.cover_image_url}
                    alt={course.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BookOpen className="h-12 w-12 text-primary/30" />
                  </div>
                )}
                {isComplete && (
                  <Badge
                    variant="default"
                    className="absolute top-3 left-3 bg-green-600"
                  >
                    Completed
                  </Badge>
                )}
                {course.is_free && (
                  <Badge className="absolute top-3 right-3 bg-blue-600">
                    FREE
                  </Badge>
                )}
                {/* Admin overlay */}
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CourseFormDialog
                      mode="edit"
                      courseId={course.id}
                      initialTitle={course.title}
                      initialDescription={course.description ?? ""}
                      onSuccess={refetch}
                      trigger={
                        <span
                          className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-white/90 shadow hover:bg-white cursor-pointer"
                          onClick={(e) => e.preventDefault()}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </span>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full bg-white/90 shadow hover:bg-white text-destructive"
                      onClick={(e) => handleDelete(course.id, e)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-sm mb-1">{course.title}</h3>
                {course.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                    {course.description}
                  </p>
                )}
                <div className="mt-auto">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                    <span>
                      {course.completed_count}/{course.total_count} lessons
                    </span>
                    <span
                      className={`font-medium ${
                        isComplete ? "text-green-600" : ""
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
