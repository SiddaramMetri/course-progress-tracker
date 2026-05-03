"use client";

import { toast } from "sonner";

/**
 * Returns a confirm function that shows a toast-based confirmation.
 * Resolves true if confirmed, false if dismissed.
 */
export function useConfirm() {
  return (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      toast(message, {
        action: {
          label: "Confirm",
          onClick: () => resolve(true),
        },
        cancel: {
          label: "Cancel",
          onClick: () => resolve(false),
        },
        onDismiss: () => resolve(false),
        duration: 10000,
      });
    });
  };
}
