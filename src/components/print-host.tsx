"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Receipt } from "@/features/kasir/receipt";
import { useAppStore } from "@/store/app-store";
import { usePrintStore } from "@/store/print-store";

export function PrintHost() {
  const transaction = usePrintStore((state) => state.transaction);
  const settings = useAppStore((state) => state.settings);

  useEffect(() => {
    if (!transaction) return;

    const handleAfterPrint = () => usePrintStore.getState().clear();
    window.addEventListener("afterprint", handleAfterPrint, { once: true });
    const timer = window.setTimeout(() => window.print(), 100);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [transaction]);

  if (!transaction) return null;

  const paperMm = Number.parseInt(settings.paperSize, 10) || 88;
  const margin = Math.max(0, settings.margin);
  const widthMm = Math.max(30, paperMm - margin * 2);

  return createPortal(
    <div id="print-root">
      <style>{`@page { size: ${paperMm}mm auto; margin: ${margin}mm; }`}</style>
      <Receipt
        transaction={transaction}
        settings={settings}
        widthMm={widthMm}
      />
    </div>,
    document.body,
  );
}
