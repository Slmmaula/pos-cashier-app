import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type Tone = "purple" | "primary" | "danger" | "success";

type StatCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: Tone;
  className?: string;
};

const tones: Record<Tone, { text: string; circle: string }> = {
  purple: { text: "text-purple", circle: "bg-purple-soft text-purple" },
  primary: { text: "text-primary", circle: "bg-primary-soft text-primary" },
  danger: { text: "text-danger", circle: "bg-danger-soft text-danger" },
  success: { text: "text-success", circle: "bg-success-soft text-success" },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  className,
}: StatCardProps) {
  const t = tones[tone];
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-card border border-line bg-card p-4 shadow-card",
        className,
      )}
    >
      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-full",
          t.circle,
        )}
      >
        <Icon className="size-6" />
      </div>
      <div className="min-w-0">
        <p className={cn("text-[13px]", t.text)}>{label}</p>
        <p className={cn("truncate text-xl font-bold", t.text)}>{value}</p>
      </div>
    </div>
  );
}
