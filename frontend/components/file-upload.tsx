"use client";

import { Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
}

export function FileUpload({ onUpload, uploading }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      onUpload(file);
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      if (inputRef.current) inputRef.current.value = "";
    },
    [handleFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
        dragOver
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        onChange={handleChange}
        className="hidden"
        disabled={uploading}
      />

      {uploading ? (
        <p className="text-sm text-muted-foreground">Uploading...</p>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drag & drop a file here, or
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            Browse Files
          </Button>
          <p className="text-xs text-muted-foreground">Max 50 MB</p>
        </div>
      )}
    </div>
  );
}
