"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { registerConfirmDialog, resolveConfirm } from "@/hooks/use-confirm";

/**
 * Global confirm dialog - mount once in providers.
 * Works with useConfirm() hook to show centered confirmation dialogs.
 */
export function ConfirmDialog() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    registerConfirmDialog(setOpen, setMessage);
  }, []);

  const handleConfirm = () => {
    setOpen(false);
    resolveConfirm(true);
  };

  const handleCancel = () => {
    setOpen(false);
    resolveConfirm(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleCancel()}>
      <DialogContent className="sm:max-w-sm">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 shrink-0">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1">
            <DialogTitle className="text-base">Are you sure?</DialogTitle>
            <DialogDescription className="mt-1.5">
              {message}
            </DialogDescription>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
