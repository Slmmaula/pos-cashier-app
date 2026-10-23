import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "outline-danger" | "outline-neutral";
type Size = "md" | "sm" | "icon";

export type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
};

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control text-sm font-semibold transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:active:scale-100";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover disabled:bg-disabled disabled:text-white disabled:hover:bg-disabled",
  outline:
    "border border-primary bg-card text-primary hover:bg-primary-soft disabled:border-line disabled:text-placeholder disabled:hover:bg-card",
  "outline-danger":
    "border border-danger bg-card text-danger hover:bg-danger-soft disabled:border-line disabled:text-placeholder disabled:hover:bg-card",
  "outline-neutral":
    "border border-line bg-card text-foreground hover:bg-surface disabled:text-placeholder disabled:hover:bg-card",
};

const sizes: Record<Size, string> = {
  md: "h-10 px-4",
  sm: "h-9 px-3 text-[13px]",
  icon: "size-9",
};

export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
