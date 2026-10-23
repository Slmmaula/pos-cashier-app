import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type BadgeProps = {
  variant?: "status" | "soft" | "solid" | "overlay";
  color?: string;
  className?: string;
  children: ReactNode;
};

const variants = {
  status: "bg-pill text-white",
  soft: "bg-primary-soft text-primary",
  solid: "text-white",
  overlay: "bg-primary/80 text-white backdrop-blur-[2px]",
};

export function Badge({
  variant = "status",
  color,
  className,
  children,
}: BadgeProps) {
  return (
    <span
      style={
        variant === "solid" && color ? { backgroundColor: color } : undefined
      }
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold leading-4",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
