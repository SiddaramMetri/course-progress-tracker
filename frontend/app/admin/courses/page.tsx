"use client";

import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  Link2,
  List,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { CourseFormDialog } from "@/components/course-form-dialog";
import { GradientCover } from "@/components/gradient-cover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdmin } from "@/hooks/use-admin";
import { useConfirm } from "@/hooks/use-confirm";
import { useCourses } from "@/hooks/use-courses";
import { toast } from "sonner";

type ViewMode = "grid" | "table";

const PAGE_SIZE_OPTIONS = [25, 50, 100];
const DEFAULT_PAGE_SIZE = 25;

export default function AdminCoursesPage() {
  const { courses, loading, error, refetch } = useCourses();
  const admin = useAdmin();
  const confirm = useConfirm();
  const [view, setView] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(courses.length / pageSize));

  // Reset to page 1 when switching views or page size
  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: string | null) => {
    if (!size) return;
    setPageSize(parseInt(size));
    setCurrentPage(1);
  };

  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return courses.slice(start, start + pageSize);
  }, [courses, currentPage, pageSize]);

  const handleDelete = async (courseId: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!(await confirm("Delete this course? This cannot be undone."))) return;
    try {
      await admin.deleteCourse(courseId);
      toast.success("Course deleted");
      refetch();
    } catch {
      toast.error("Failed to delete course");
    }
  };

  const handleCopyUrl = (courseId: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const url = `${window.location.origin}/courses/${courseId}`;
    navigator.clipboard.writeText(url);
    toast.success("Course URL copied to clipboard");
  };

  // Generate page numbers with ellipsis
  const pageNumbers = useMemo(() => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <AppShell>
      <div className="px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Courses</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage all courses, modules, and lessons.
              {!loading && (
                <span className="ml-1 text-foreground font-medium">
                  {courses.length} total
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center border rounded-lg p-0.5">
              <Button
                variant={view === "grid" ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2"
                onClick={() => handleViewChange("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={view === "table" ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2"
                onClick={() => handleViewChange("table")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

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
          </div>
        </div>

        {/* Loading */}
        {loading && (
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
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
            <p className="text-destructive font-medium">
              Failed to load courses
            </p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && courses.length === 0 && (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No courses yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first course to get started.
            </p>
          </div>
        )}

        {/* Grid View */}
        {!loading && !error && courses.length > 0 && view === "grid" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedCourses.map((course) => {
              const pct =
                course.total_count > 0
                  ? Math.round(
                      (course.completed_count / course.total_count) * 100
                    )
                  : 0;

              return (
                <Link key={course.id} href={`/courses/${course.id}`}>
                  <div className="rounded-xl border overflow-hidden transition-all hover:shadow-lg hover:border-primary/30 cursor-pointer group relative h-full flex flex-col">
                    <GradientCover
                      height="h-40"
                      variant={course.is_free ? "green" : "primary"}
                      showIcon={!course.cover_image_url}
                    >
                      {course.cover_image_url && (
                        <Image
                          src={course.cover_image_url}
                          alt={course.title}
                          fill
                          className="object-cover absolute inset-0"
                          unoptimized
                        />
                      )}
                      {course.is_free ? (
                        <Badge className="absolute top-3 right-3 bg-blue-600">
                          FREE
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="absolute top-3 right-3 shadow-sm"
                        >
                          <Star className="h-3 w-3 mr-1 text-amber-500" />
                          Premium
                        </Badge>
                      )}
                      {/* Admin overlay */}
                      <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CourseFormDialog
                          mode="edit"
                          courseId={course.id}
                          initialTitle={course.title}
                          initialDescription={course.description ?? ""}
                          initialCoverUrl={course.cover_image_url ?? undefined}
                          initialIsFree={course.is_free}
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
                          className="h-7 w-7 rounded-full bg-white/90 shadow hover:bg-white"
                          onClick={(e) => handleCopyUrl(course.id, e)}
                          title="Copy course URL"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full bg-white/90 shadow hover:bg-white text-destructive"
                          onClick={(e) => handleDelete(course.id, e)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </GradientCover>

                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-sm mb-1">
                        {course.title}
                      </h3>
                      {course.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                          {course.description}
                        </p>
                      )}
                      <div className="mt-auto">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                          <span>
                            {course.completed_count}/{course.total_count}{" "}
                            lessons
                          </span>
                          <span className="font-medium">{pct}%</span>
                        </div>
                        <Progress value={pct} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Table View */}
        {!loading && !error && courses.length > 0 && view === "table" && (
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Course</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Lessons</TableHead>
                  <TableHead className="text-center">Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCourses.map((course) => {
                  const pct =
                    course.total_count > 0
                      ? Math.round(
                          (course.completed_count / course.total_count) * 100
                        )
                      : 0;

                  return (
                    <TableRow key={course.id}>
                      <TableCell>
                        <Link
                          href={`/courses/${course.id}`}
                          className="hover:underline"
                        >
                          <div>
                            <p className="font-medium">{course.title}</p>
                            {course.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                                {course.description}
                              </p>
                            )}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        {course.is_free ? (
                          <Badge className="bg-blue-600">FREE</Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Star className="h-3 w-3 mr-1 text-amber-500" />
                            Premium
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {course.completed_count}/{course.total_count}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <Progress value={pct} className="h-1.5 w-20" />
                          <span className="text-xs text-muted-foreground w-8">
                            {pct}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <CourseFormDialog
                            mode="edit"
                            courseId={course.id}
                            initialTitle={course.title}
                            initialDescription={course.description ?? ""}
                            onSuccess={refetch}
                            trigger={
                              <span className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted cursor-pointer">
                                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                              </span>
                            }
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => handleCopyUrl(course.id, e)}
                            title="Copy course URL"
                          >
                            <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={(e) => handleDelete(course.id, e)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && courses.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Rows per page</span>
              <Select
                value={String(pageSize)}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="ml-2">
                Showing {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, courses.length)} of{" "}
                {courses.length}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {pageNumbers.map((page, idx) =>
                page === "ellipsis" ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
