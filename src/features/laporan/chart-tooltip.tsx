import { formatLongDate, formatRupiah } from "@/lib/format";
import { parseDayKey } from "./report-data";

type Entry = {
  name?: string | number;
  value?: number | string;
  color?: string;
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: ReadonlyArray<Entry>;
  label?: string | number;
};

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0 || label === undefined) {
    return null;
  }

  return (
    <div className="rounded-control bg-navy px-3 py-2 text-white shadow-modal">
      <p className="text-xs font-bold">
        {formatLongDate(parseDayKey(String(label)))}
      </p>
      {payload.map((entry) => (
        <p
          key={String(entry.name)}
          className="mt-1 flex items-center gap-1.5 text-[11px]"
        >
          <span
            className="inline-block h-3 w-1 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          {payload.length > 1 && <span>{entry.name}:</span>}
          <span>{formatRupiah(Number(entry.value ?? 0))}</span>
        </p>
      ))}
    </div>
  );
}
