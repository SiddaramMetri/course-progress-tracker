"use client";

/**
 * Returns a confirm function that shows a proper centered dialog.
 * Uses the native confirm as a base but we'll create a better solution.
 */

let _resolve: ((value: boolean) => void) | null = null;
let _setOpen: ((open: boolean) => void) | null = null;
let _setMessage: ((msg: string) => void) | null = null;

export function useConfirm() {
  return (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (_setOpen && _setMessage) {
        _resolve = resolve;
        _setMessage(message);
        _setOpen(true);
      } else {
        // Fallback to native if ConfirmDialog not mounted
        resolve(window.confirm(message));
      }
    });
  };
}

export function registerConfirmDialog(
  setOpen: (open: boolean) => void,
  setMessage: (msg: string) => void
) {
  _setOpen = setOpen;
  _setMessage = setMessage;
}

export function resolveConfirm(value: boolean) {
  _resolve?.(value);
  _resolve = null;
}
