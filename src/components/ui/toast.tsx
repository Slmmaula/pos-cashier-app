"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CircleCheck, CircleX } from "lucide-react";
import { useToastStore } from "@/store/toast-store";
import { cn } from "@/lib/cn";

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-6 top-[76px] z-[60] flex flex-col items-end gap-2"
    >
      <AnimatePresence initial={false}>
        {toasts.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 48 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={cn(
              "pointer-events-auto flex items-center gap-2 rounded-card border bg-card px-4 py-2.5 text-[13px] font-medium text-primary shadow-modal",
              item.variant === "success"
                ? "border-primary/25"
                : "border-danger-border text-danger",
            )}
          >
            {item.variant === "success" ? (
              <CircleCheck className="size-4 shrink-0 text-primary" />
            ) : (
              <CircleX className="size-4 shrink-0 text-danger" />
            )}
            {item.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
