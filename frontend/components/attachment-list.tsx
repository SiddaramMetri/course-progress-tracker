"use client";

import {
  Download,
  File,
  FileText,
  Image,
  Trash2,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AttachmentOut } from "@/types";

interface AttachmentListProps {
  attachments: AttachmentOut[];
  loading: boolean;
  onDelete?: (attachmentId: string) => Promise<void>;
}

function getFileIcon(contentType: string) {
  if (contentType.startsWith("image/")) return Image;
  if (contentType.startsWith("video/")) return Video;
  if (
    contentType.includes("pdf") ||
    contentType.includes("document") ||
    contentType.includes("text")
  )
    return FileText;
  return File;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentList({
  attachments,
  loading,
  onDelete,
}: AttachmentListProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (attachments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No attachments yet.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {attachments.map((attachment) => {
        const Icon = getFileIcon(attachment.content_type);

        return (
          <li
            key={attachment.id}
            className="flex items-center gap-3 rounded-lg border px-3 py-2"
          >
            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {attachment.filename}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(attachment.size_bytes)}
              </p>
            </div>
            <a
              href={attachment.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Download className="h-4 w-4" />
              </Button>
            </a>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(attachment.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
