"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export type TabItem<T extends string> = {
  value: T;
  label: string;
  icon?: LucideIcon;
};

type TabsProps<T extends string> = {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: "solid" | "soft";
  className?: string;
};

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  variant = "solid",
  className,
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        variant === "solid"
          ? "flex flex-wrap gap-2"
          : "inline-flex flex-wrap gap-1 rounded-card bg-surface p-1",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        const Icon = item.icon;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-control px-3 text-[13px] font-semibold transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              variant === "solid"
                ? active
                  ? "border border-primary bg-primary text-white"
                  : "border border-line bg-card text-muted hover:bg-surface"
                : active
                  ? "bg-primary-soft text-primary"
                  : "text-foreground hover:bg-card",
            )}
          >
            {Icon && <Icon className="size-4" />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
