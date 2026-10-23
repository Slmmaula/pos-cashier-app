import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-line bg-surface px-4 py-10 text-center",
        className,
      )}
    >
      <Icon className="size-6 text-placeholder" />
      <p className="text-[13px] font-medium text-placeholder">{title}</p>
      {description && <p className="text-xs text-placeholder">{description}</p>}
    </div>
  );
}
