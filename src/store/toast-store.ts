import { create } from "zustand";

export type ToastVariant = "success" | "error";

export type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastState = {
  toasts: ToastItem[];
  show: (message: string, variant?: ToastVariant) => void;
  dismiss: (id: number) => void;
};

const DURATION_MS = 2000;
const MAX_TOASTS = 3;

let nextId = 1;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  show: (message, variant = "success") => {
    const id = nextId++;
    set((state) => ({
      toasts: [...state.toasts, { id, message, variant }].slice(-MAX_TOASTS),
    }));
    setTimeout(() => get().dismiss(id), DURATION_MS);
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (message: string) =>
    useToastStore.getState().show(message, "success"),
  error: (message: string) => useToastStore.getState().show(message, "error"),
};
