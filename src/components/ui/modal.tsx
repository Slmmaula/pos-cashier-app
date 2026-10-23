"use client";

import { useEffect, useId, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  closeOnOverlay?: boolean;
  widthClassName?: string;
};

const emptySubscribe = () => () => {};

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  closeOnOverlay = true,
  widthClassName = "max-w-[540px]",
}: ModalProps) {
  const titleId = useId();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={(event) => {
            if (closeOnOverlay && event.target === event.currentTarget)
              onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cn(
              "flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-card bg-card shadow-modal",
              widthClassName,
            )}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5">
              <h2 id={titleId} className="text-base font-bold text-foreground">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="flex size-8 items-center justify-center rounded-control text-foreground transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-primary"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {subtitle && (
                <p className="mb-4 text-[13px] text-foreground">{subtitle}</p>
              )}
              {children}
            </div>

            {footer && (
              <div className="shrink-0 border-t border-line px-5 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
