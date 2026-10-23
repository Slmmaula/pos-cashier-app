"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import {
  EMPTY_PERIOD,
  formatPeriod,
  isPeriodActive,
  type Period,
} from "@/lib/period";

type PeriodFormProps = {
  value: Period;
  onApply: (period: Period) => void;
};

function PeriodForm({ value, onApply }: PeriodFormProps) {
  const [from, setFrom] = useState(value.from);
  const [to, setTo] = useState(value.to);
  const invalid = from !== "" && to !== "" && from > to;

  return (
    <div className="flex flex-col gap-3">
      <Input
        label="Dari tanggal"
        type="date"
        value={from}
        max={to || undefined}
        onChange={(event) => setFrom(event.target.value)}
        className="dark:[color-scheme:dark]"
      />
      <Input
        label="Sampai tanggal"
        type="date"
        value={to}
        min={from || undefined}
        error={invalid ? "Tanggal awal melebihi tanggal akhir" : undefined}
        onChange={(event) => setTo(event.target.value)}
        className="dark:[color-scheme:dark]"
      />
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline-neutral"
          size="sm"
          onClick={() => onApply(EMPTY_PERIOD)}
        >
          Reset
        </Button>
        <Button
          size="sm"
          disabled={invalid}
          onClick={() => onApply({ from, to })}
        >
          Terapkan
        </Button>
      </div>
    </div>
  );
}

type DateRangeFilterProps = {
  value: Period;
  onChange: (period: Period) => void;
  className?: string;
};

export function DateRangeFilter({
  value,
  onChange,
  className,
}: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const active = isPeriodActive(value);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Button
        variant="outline-neutral"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(active && "border-primary text-primary")}
      >
        <CalendarDays className="size-4" />
        {formatPeriod(value)}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 top-full z-30 mt-2 w-[290px] rounded-card border border-line bg-card p-4 shadow-modal"
          >
            <PeriodForm
              value={value}
              onApply={(period) => {
                onChange(period);
                setOpen(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
