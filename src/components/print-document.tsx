"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

type PrintDocumentProps = {
  onDone: () => void;
  children: ReactNode;
  pageSize?: string;
  marginMm?: number;
};

export function PrintDocument({
  onDone,
  children,
  pageSize = "A4 landscape",
  marginMm = 12,
}: PrintDocumentProps) {
  useEffect(() => {
    const handleAfterPrint = () => onDone();
    window.addEventListener("afterprint", handleAfterPrint, { once: true });
    const timer = window.setTimeout(() => window.print(), 100);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [onDone]);

  return createPortal(
    <div id="print-root">
      <style>{`@page { size: ${pageSize}; margin: ${marginMm}mm; }`}</style>
      {children}
    </div>,
    document.body,
  );
}
