import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Align = "left" | "right" | "center";

const alignClass: Record<Align, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

export function Table({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-card border border-line",
        className,
      )}
    >
      <table className="w-full border-collapse text-[13px]">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-line">
      <tr>{children}</tr>
    </thead>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function Tr({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "border-b border-line transition-colors last:border-b-0 hover:bg-surface/60",
        className,
      )}
      {...props}
    />
  );
}

type CellProps = { align?: Align } & Omit<ComponentProps<"td">, "align">;

export function Th({ align = "left", className, ...props }: CellProps) {
  return (
    <th
      className={cn(
        "whitespace-nowrap px-3 py-3.5 font-semibold text-foreground",
        alignClass[align],
        className,
      )}
      {...props}
    />
  );
}

export function Td({ align = "left", className, ...props }: CellProps) {
  return (
    <td
      className={cn(
        "px-3 py-3 align-middle text-foreground",
        alignClass[align],
        className,
      )}
      {...props}
    />
  );
}

type TableInfoProps = {
  total: number;
  from?: number;
  to?: number;
};

export function TableInfo({ total, from, to }: TableInfoProps) {
  return (
    <p className="text-[13px] text-muted">
      {total === 0
        ? "Menampilkan 0 dari 0 data"
        : `Menampilkan ${from ?? 1} - ${to ?? total} dari ${total} data`}
    </p>
  );
}
