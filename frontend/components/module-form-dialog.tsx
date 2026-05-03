"use client";

import { useState } from "react";
import { toast } from "sonner";

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
import { useAdmin } from "@/hooks/use-admin";

interface ModuleFormDialogProps {
  mode: "create" | "edit";
  courseId?: string;
  moduleId?: string;
  initialTitle?: string;
  initialSortOrder?: number;
  onSuccess: () => void;
  trigger: React.ReactNode;
}

export function ModuleFormDialog({
  mode,
  courseId,
  moduleId,
  initialTitle = "",
  initialSortOrder = 0,
  onSuccess,
  trigger,
}: ModuleFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);
  const [saving, setSaving] = useState(false);
  const admin = useAdmin();

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setTitle(initialTitle);
      setSortOrder(initialSortOrder);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!title.trim()) return;
    setSaving(true);
    try {
      if (mode === "create" && courseId) {
        await admin.createModule(courseId, {
          title: title.trim(),
          sort_order: sortOrder,
        });
      } else if (mode === "edit" && moduleId) {
        await admin.updateModule(moduleId, {
          title: title.trim(),
          sort_order: sortOrder,
        });
      }
      setOpen(false);
      toast.success(mode === "create" ? "Module created" : "Module updated");
      onSuccess();
    } catch {
      toast.error("Failed to save module");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogTitle>
          {mode === "create" ? "New Module" : "Edit Module"}
        </DialogTitle>
        <DialogDescription>
          {mode === "create"
            ? "Add a new module to this course."
            : "Update module details."}
        </DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="module-title">Title</Label>
            <Input
              id="module-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Module title"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="module-order">Sort Order</Label>
            <Input
              id="module-order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={saving || !title.trim()}>
              {saving ? "Saving..." : mode === "create" ? "Create" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
