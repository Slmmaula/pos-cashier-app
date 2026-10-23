import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type FieldProps = {
  id?: string;
  label?: string;
  required?: boolean;
  error?: string;
  helper?: string;
  className?: string;
  children: ReactNode;
};

export const controlBase =
  "w-full rounded-control border bg-card text-sm text-foreground outline-none transition placeholder:text-placeholder focus:ring-2 disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted";

export function controlState(error?: string): string {
  return error
    ? "border-danger focus:border-danger focus:ring-danger/20"
    : "border-line focus:border-primary focus:ring-primary/20";
}

export function Field({
  id,
  label,
  required,
  error,
  helper,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-[13px] font-medium text-foreground">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : helper ? (
        <p className="text-xs text-muted">{helper}</p>
      ) : null}
    </div>
  );
}
