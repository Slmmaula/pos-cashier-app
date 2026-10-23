"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export const PAGE_SIZE = 10;

export type PageResult<T> = {
  rows: T[];
  page: number;
  totalPages: number;
  from: number;
  to: number;
};

export function paginate<T>(
  items: T[],
  page: number,
  pageSize = PAGE_SIZE,
): PageResult<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  return {
    rows: items.slice(start, start + pageSize),
    page: current,
    totalPages,
    from: items.length === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, items.length),
  };
}

function pageList(
  current: number,
  total: number,
): (number | "gap-left" | "gap-right")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const result: (number | "gap-left" | "gap-right")[] = [];
  sorted.forEach((p, index) => {
    const prev = sorted[index - 1];
    if (prev !== undefined && p - prev > 1) {
      result.push(index === 1 ? "gap-left" : "gap-right");
    }
    result.push(p);
  });
  return result;
}

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
};

const buttonBase =
  "flex size-8 items-center justify-center rounded-control border text-[13px] font-semibold tabular-nums transition active:scale-95 focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100";

export function Pagination({
  page,
  totalPages,
  onChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Halaman"
      className={cn("flex items-center gap-1.5", className)}
    >
      <button
        type="button"
        aria-label="Halaman sebelumnya"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={cn(
          buttonBase,
          "border-line bg-card text-foreground hover:bg-surface",
        )}
      >
        <ChevronLeft className="size-4" />
      </button>

      {pageList(page, totalPages).map((item) =>
        typeof item === "string" ? (
          <span
            key={item}
            className="flex size-8 items-center justify-center text-[13px] text-muted"
          >
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-label={`Halaman ${item}`}
            aria-current={item === page ? "page" : undefined}
            onClick={() => onChange(item)}
            className={cn(
              buttonBase,
              item === page
                ? "border-primary bg-primary text-white"
                : "border-line bg-card text-foreground hover:bg-surface",
            )}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Halaman berikutnya"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className={cn(
          buttonBase,
          "border-line bg-card text-foreground hover:bg-surface",
        )}
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
