"use client";

import { useCallback, useState } from "react";
import { Info } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useDemoReset } from "@/lib/demo/use-demo-reset";

export function DemoBanner() {
  const [open, setOpen] = useState(false);
  const resetDemo = useDemoReset();
  const close = useCallback(() => setOpen(false), []);

  async function confirm() {
    setOpen(false);
    await resetDemo();
  }

  return (
    <>
      <div className="flex shrink-0 items-center justify-between gap-3 bg-primary-soft px-6 py-2 text-xs text-primary">
        <span className="flex items-center gap-2 font-medium">
          <Info className="size-3.5 shrink-0" />
          Mode demo: semua data hanya tersimpan di browser Anda dan tidak
          dikirim ke mana pun.
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 font-semibold underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-primary"
        >
          Reset demo
        </button>
      </div>

      <ConfirmModal
        open={open}
        onClose={close}
        onConfirm={() => void confirm()}
        title="Reset Demo"
        message="Semua data demo, termasuk transaksi dan perubahan yang Anda buat, akan dikembalikan ke data contoh awal. Lanjutkan?"
        confirmLabel="Reset"
      />
    </>
  );
}
