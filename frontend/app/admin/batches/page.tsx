"use client";

import {
  Calendar,
  ChevronRight,
  Layers,
  Lock,
  Pencil,
  Plus,
  Trash2,
  Unlock,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api";
import type { CourseListItem } from "@/types";

interface Batch {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  student_count: number;
  course_count: number;
  created_at: string;
}

interface ModuleSchedule {
  id: string;
  module_id: string;
  module_title: string;
  unlock_date: string;
  is_unlocked: boolean;
}

interface PublishedCourse {
  id: string;
  course_id: string;
  course_title: string;
  publish_date: string;
  is_published: boolean;
  module_schedules: ModuleSchedule[];
}

interface StudentInfo {
  id: string;
  name: string;
  email: string;
  progress_percent: number;
}

interface BatchDetail {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  student_count: number;
  students: StudentInfo[];
  published_courses: PublishedCourse[];
  created_at: string;
}

// --- Batch Form Dialog ---
function BatchFormDialog({
  mode,
  batch,
  onSuccess,
  trigger,
}: {
  mode: "create" | "edit";
  batch?: Batch;
  onSuccess: () => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(batch?.name ?? "");
  const [description, setDescription] = useState(batch?.description ?? "");
  const [startDate, setStartDate] = useState(batch?.start_date ?? "");
  const [endDate, setEndDate] = useState(batch?.end_date ?? "");
  const [saving, setSaving] = useState(false);

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setName(batch?.name ?? "");
      setDescription(batch?.description ?? "");
      setStartDate(batch?.start_date ?? "");
      setEndDate(batch?.end_date ?? "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const data = {
        name: name.trim(),
        description: description.trim() || null,
        start_date: startDate || null,
        end_date: endDate || null,
      };
      if (mode === "create") {
        await apiFetch("/admin/batches", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } else if (batch) {
        await apiFetch(`/admin/batches/${batch.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      }
      setOpen(false);
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>
          {mode === "create" ? "New Batch" : "Edit Batch"}
        </DialogTitle>
        <DialogDescription>
          {mode === "create"
            ? "Create a new student batch/cohort."
            : "Update batch details."}
        </DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="batch-name">Name *</Label>
            <Input
              id="batch-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. July-2026"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="batch-desc">Description</Label>
            <Input
              id="batch-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="batch-start">Start Date</Label>
              <Input
                id="batch-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch-end">End Date</Label>
              <Input
                id="batch-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={saving || !name.trim()}>
              {saving ? "Saving..." : mode === "create" ? "Create" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Publish Course Dialog ---
function PublishCourseDialog({
  batchId,
  publishedCourseIds,
  onSuccess,
}: {
  batchId: string;
  publishedCourseIds: string[];
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [allCourses, setAllCourses] = useState<CourseListItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [publishDate, setPublishDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [saving, setSaving] = useState(false);

  const availableCourses = allCourses.filter(
    (c) => !publishedCourseIds.includes(c.id)
  );

  useEffect(() => {
    if (open) {
      apiFetch<CourseListItem[]>("/courses")
        .then(setAllCourses)
        .catch(() => {});
      setSelectedIds(new Set());
    }
  }, [open]);

  const toggleCourse = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePublish = async () => {
    if (selectedIds.size === 0 || !publishDate) return;
    setSaving(true);
    try {
      for (const courseId of selectedIds) {
        await apiFetch(`/admin/batches/${batchId}/publish`, {
          method: "POST",
          body: JSON.stringify({
            course_id: courseId,
            publish_date: publishDate,
          }),
        });
      }
      setOpen(false);
      onSuccess();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to publish");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <span className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer">
          <Plus className="h-3 w-3" />
          Publish Course
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Publish Courses to Batch</DialogTitle>
        <DialogDescription>
          Select courses and a start date. Module schedules auto-generate (1
          week apart per module).
        </DialogDescription>

        <div className="space-y-4 mt-2">
          {/* Course Selection */}
          <div className="space-y-2">
            <Label>Select Courses</Label>
            {availableCourses.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  All courses are already published to this batch.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {availableCourses.map((course) => {
                  const isSelected = selectedIds.has(course.id);
                  return (
                    <div
                      key={course.id}
                      onClick={() => toggleCourse(course.id)}
                      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border-2 shrink-0 transition-colors ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{course.title}</p>
                        {course.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {course.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        {course.total_count} lessons
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
            {selectedIds.size > 0 && (
              <p className="text-xs text-primary font-medium">
                {selectedIds.size} course{selectedIds.size > 1 ? "s" : ""}{" "}
                selected
              </p>
            )}
          </div>

          {/* Publish Date */}
          <div className="space-y-2">
            <Label>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Start Date
              </span>
            </Label>
            <Input
              type="date"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Modules will unlock weekly from this date.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePublish}
              disabled={saving || selectedIds.size === 0}
            >
              {saving
                ? "Publishing..."
                : `Publish ${selectedIds.size || ""} Course${selectedIds.size > 1 ? "s" : ""}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Page ---
export default function AdminBatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [batchDetail, setBatchDetail] = useState<BatchDetail | null>(null);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Batch[]>("/admin/batches");
      setBatches(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const handleDelete = async (batchId: string) => {
    if (!confirm("Delete this batch? Students will be unassigned.")) return;
    await apiFetch(`/admin/batches/${batchId}`, { method: "DELETE" });
    fetchBatches();
  };

  const openDetail = async (batchId: string) => {
    const detail = await apiFetch<BatchDetail>(
      `/admin/batches/${batchId}/detail`
    );
    setBatchDetail(detail);
    setDetailOpen(true);
  };

  const refreshDetail = async () => {
    if (batchDetail) {
      const detail = await apiFetch<BatchDetail>(
        `/admin/batches/${batchDetail.id}/detail`
      );
      setBatchDetail(detail);
    }
  };

  const handleUnpublish = async (batchCourseId: string) => {
    if (!confirm("Remove this course from the batch?")) return;
    await apiFetch(`/admin/batches/courses/${batchCourseId}`, {
      method: "DELETE",
    });
    refreshDetail();
  };

  const handleScheduleChange = async (
    scheduleId: string,
    moduleId: string,
    newDate: string
  ) => {
    await apiFetch(`/admin/batches/schedules/${scheduleId}`, {
      method: "PUT",
      body: JSON.stringify({ module_id: moduleId, unlock_date: newDate }),
    });
    refreshDetail();
  };

  return (
    <AppShell>
      <div className="px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Layers className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Batch Management
              </h1>
              <p className="text-sm text-muted-foreground">
                Create batches, publish courses, and schedule module unlocks.
              </p>
            </div>
          </div>
          <BatchFormDialog
            mode="create"
            onSuccess={fetchBatches}
            trigger={
              <span className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer">
                <Plus className="h-4 w-4" />
                New Batch
              </span>
            }
          />
        </div>

        {/* Batches Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Name</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : batches.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No batches yet.
                  </TableCell>
                </TableRow>
              ) : (
                batches.map((batch) => (
                  <TableRow
                    key={batch.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => openDetail(batch.id)}
                  >
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-medium">{batch.name}</span>
                        </div>
                        {batch.description && (
                          <p className="text-xs text-muted-foreground ml-6 line-clamp-1">
                            {batch.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {batch.start_date && batch.end_date ? (
                        <div className="text-xs">
                          <span className="text-muted-foreground">
                            {batch.start_date}
                          </span>
                          <span className="text-muted-foreground/50 mx-1">→</span>
                          <span className="text-muted-foreground">
                            {batch.end_date}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {batch.course_count} course{batch.course_count !== 1 ? "s" : ""}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {batch.student_count}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {batch.course_count > 0 ? (
                        <Badge variant="default" className="text-xs bg-green-600">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          No courses
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className="flex justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <BatchFormDialog
                          mode="edit"
                          batch={batch}
                          onSuccess={fetchBatches}
                          trigger={
                            <span className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted cursor-pointer">
                              <Pencil className="h-4 w-4" />
                            </span>
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(batch.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openDetail(batch.id)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Batch Detail Side Panel */}
        <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
          <SheetContent
            side="right"
            className="sm:max-w-xl w-full overflow-y-auto"
          >
            {batchDetail && (
              <>
                <SheetHeader>
                  <SheetTitle>{batchDetail.name}</SheetTitle>
                  <SheetDescription>
                    {batchDetail.description || "No description"}
                    {batchDetail.start_date && batchDetail.end_date && (
                      <span className="block mt-1">
                        {batchDetail.start_date} → {batchDetail.end_date}
                      </span>
                    )}
                  </SheetDescription>
                </SheetHeader>

                <div className="px-4 pb-6 space-y-6">
                  {/* Published Courses */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold">
                        Published Courses
                      </h3>
                      <PublishCourseDialog
                        batchId={batchDetail.id}
                        publishedCourseIds={batchDetail.published_courses.map(
                          (pc) => pc.course_id
                        )}
                        onSuccess={refreshDetail}
                      />
                    </div>

                    {batchDetail.published_courses.length === 0 ? (
                      <p className="text-sm text-muted-foreground rounded-lg border border-dashed p-4 text-center">
                        No courses published yet. Click "Publish Course" to
                        assign one.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {batchDetail.published_courses.map((pc) => (
                          <div key={pc.id} className="rounded-lg border p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-sm font-medium">
                                  {pc.course_title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Published: {pc.publish_date}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => handleUnpublish(pc.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>

                            {/* Module Unlock Schedule */}
                            <div className="space-y-2 mt-3">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Module Schedule
                              </p>
                              {pc.module_schedules.map((ms) => (
                                <div
                                  key={ms.id}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  {ms.is_unlocked ? (
                                    <Unlock className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                  ) : (
                                    <Lock className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                                  )}
                                  <span className="flex-1 truncate">
                                    {ms.module_title}
                                  </span>
                                  <Input
                                    type="date"
                                    value={ms.unlock_date}
                                    onChange={(e) =>
                                      handleScheduleChange(
                                        ms.id,
                                        ms.module_id,
                                        e.target.value
                                      )
                                    }
                                    className="h-7 w-[130px] text-xs"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Students */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">
                      Students ({batchDetail.student_count})
                    </h3>
                    {batchDetail.students.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No students in this batch.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {batchDetail.students.map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center gap-3 rounded-lg border p-2"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {student.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {student.email}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 w-24">
                              <Progress
                                value={student.progress_percent}
                                className="h-1.5 flex-1"
                              />
                              <span className="text-xs text-muted-foreground">
                                {student.progress_percent}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AppShell>
  );
}
