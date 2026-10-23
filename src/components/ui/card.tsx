import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type CardProps = ComponentProps<"div"> & {
  padded?: boolean;
};

export function Card({ padded = true, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-card shadow-card",
        padded && "p-5",
        className,
      )}
      {...props}
    />
  );
}
