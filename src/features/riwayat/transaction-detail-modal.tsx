"use client";

import type { ReactNode } from "react";
import { Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/cn";
import { formatDateTime, formatRupiah, formatRupiahTight } from "@/lib/format";
import type { Transaction } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { usePrintStore } from "@/store/print-store";

function InfoCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted">{label}</span>
      <div className="text-[13px] font-bold text-foreground">{children}</div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success";
}) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className={cn(tone === "success" ? "text-success" : "text-muted")}>
        {label}
      </span>
      <span
        className={cn(
          "tabular-nums",
          tone === "success" ? "text-success" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function Dashed() {
  return <div className="border-t border-dashed border-line" />;
}

type TransactionDetailModalProps = {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
};

export function TransactionDetailModal({
  open,
  onClose,
  transaction: t,
}: TransactionDetailModalProps) {
  const ppnRate = useAppStore((state) => state.settings.ppnRate);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detail Transaksi"
      widthClassName="max-w-[560px]"
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
          <Button
            onClick={() => {
              if (t) usePrintStore.getState().print(t);
            }}
          >
            <Printer className="size-4" />
            Cetak ulang
          </Button>
        </div>
      }
    >
      {t && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-card bg-primary-soft p-4">
            <InfoCell label="No. Transaksi">{t.trxNo}</InfoCell>
            <InfoCell label="Tanggal/Jam">
              {formatDateTime(t.createdAt)}
            </InfoCell>
            <InfoCell label="Kasir">{t.cashier}</InfoCell>
            <InfoCell label="Status">
              <Badge>{t.status}</Badge>
            </InfoCell>
            <InfoCell label="Nama customer">{t.customerName}</InfoCell>
          </div>

          <Dashed />

          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-foreground">
              Item Transaksi
            </p>
            {t.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-start justify-between gap-3 rounded-control border border-line bg-surface p-3"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-foreground">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {formatRupiahTight(item.price)} X{item.qty}
                  </p>
                </div>
                <p className="shrink-0 text-[13px] font-bold tabular-nums text-primary">
                  {formatRupiah(item.price * item.qty)}
                </p>
              </div>
            ))}
          </div>

          <Dashed />

          <div className="flex flex-col gap-2.5">
            <SummaryRow label="Sub total" value={formatRupiah(t.subtotal)} />
            {t.discountAmount > 0 && (
              <SummaryRow
                label={
                  t.discountType === "percent"
                    ? `Diskon (${t.discountValue}%)`
                    : "Diskon"
                }
                value={`-${formatRupiah(t.discountAmount)}`}
              />
            )}
            {t.ppnEnabled && (
              <SummaryRow
                label={`PPN ${ppnRate}%`}
                value={formatRupiah(t.ppnAmount)}
              />
            )}
            {t.roundingAmount !== 0 && (
              <SummaryRow
                label="Pembulatan"
                value={formatRupiah(t.roundingAmount)}
              />
            )}
          </div>

          <Dashed />

          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted">Total pembayaran</span>
            <span className="text-xl font-bold tabular-nums text-primary">
              {formatRupiah(t.total)}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-foreground">Pembayaran</p>
            <SummaryRow label={t.method} value={formatRupiah(t.paid)} />
            <SummaryRow
              label="Kembalian"
              value={formatRupiah(t.change)}
              tone="success"
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
