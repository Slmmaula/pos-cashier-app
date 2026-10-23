import type { ReactNode } from "react";
import { Toggle } from "@/components/ui/toggle";

export function SettingsCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-card border border-line p-5">
      <h2 className="mb-4 text-base font-bold text-foreground">{title}</h2>
      <div className="flex max-w-xl flex-col gap-4">{children}</div>
    </section>
  );
}

type ToggleBoxProps = {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  note?: string;
};

export function ToggleBox({
  title,
  description,
  checked,
  onChange,
  note,
}: ToggleBoxProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-4 rounded-control border border-line px-4 py-3">
        <div>
          <p className="text-[13px] font-bold text-foreground">{title}</p>
          <p className="text-xs text-muted">{description}</p>
        </div>
        <Toggle checked={checked} onChange={onChange} aria-label={title} />
      </div>
      {note && <p className="text-xs text-muted">{note}</p>}
    </div>
  );
}
