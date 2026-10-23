"use client";

import { useEffect, useRef, useState } from "react";
import {
  Banknote,
  CreditCard,
  Printer,
  QrCode,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/cn";
import { peekNextOrderId } from "@/lib/db/transactions";
import { formatRupiah, parseRupiah } from "@/lib/format";
import { formatOrderId } from "@/lib/order";
import type { PaymentMethod } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { useCartStore } from "@/store/cart-store";
import { usePrintStore } from "@/store/print-store";
import { toast } from "@/store/toast-store";
import { useCartSummary } from "./use-cart-summary";

const METHODS: { value: PaymentMethod; label: string; icon: LucideIcon }[] = [
  { value: "Tunai", label: "Tunai", icon: Banknote },
  { value: "QRIS", label: "QRIS", icon: QrCode },
  { value: "Debit", label: "Debit", icon: CreditCard },
];

const QUICK_AMOUNTS = [50000, 100000, 150000, 200000];

function defaultPaid(total: number): number {
  return QUICK_AMOUNTS.find((amount) => amount >= total) ?? total;
}

type PaymentModalProps = {
  open: boolean;
  onClose: () => void;
};

export function PaymentModal({ open, onClose }: PaymentModalProps) {
  const summary = useCartSummary();
  const setMethod = useCartStore((state) => state.setMethod);
  const autoPrint = useAppStore((state) => state.settings.autoPrint);

  const [orderNo, setOrderNo] = useState<number | null | undefined>(undefined);
  const [customer, setCustomer] = useState("");
  const [customerError, setCustomerError] = useState("");
  const [paid, setPaid] = useState(() => defaultPaid(summary.totals.total));
  const [paidError, setPaidError] = useState("");
  const [frozenTotal, setFrozenTotal] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const submitted = useRef(false);

  useEffect(() => {
    let cancelled = false;
    void peekNextOrderId().then((value) => {
      if (!cancelled) setOrderNo(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const total = frozenTotal ?? summary.totals.total;
  const method = summary.method;
  const isCash = method === "Tunai";
  const effectivePaid = isCash ? paid : total;
  const change = effectivePaid - total;

  async function submit(print: boolean) {
    if (submitted.current || saving) return;

    const name = customer.trim();
    if (!name) {
      setCustomerError("Nama customer wajib diisi");
      return;
    }
    if (effectivePaid < total) {
      setPaidError("Jumlah bayar kurang dari total");
      return;
    }

    setSaving(true);
    const result = await useAppStore.getState().checkout({
      customerName: name,
      items: summary.items.map((item) => ({
        productId: item.product.id,
        qty: item.qty,
      })),
      discountType: summary.discountType,
      discountValue: summary.discountValue,
      ppnEnabled: summary.ppnEnabled,
      method,
      paid: effectivePaid,
    });

    if (!result.ok) {
      setSaving(false);
      toast.error(result.error);
      return;
    }

    submitted.current = true;
    setFrozenTotal(total);
    useCartStore.getState().clear();
    onClose();
    toast.success("Transaksi berhasil disimpan");
    if (print) usePrintStore.getState().print(result.transaction);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
      event.preventDefault();
      void submit(autoPrint);
    }
  }

  const orderLabel =
    orderNo === undefined
      ? "..."
      : orderNo === null
        ? "-"
        : formatOrderId(orderNo);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pembayaran"
      subtitle="Silakan pilih metode pembayaran dan masukkan jumlah yang dibayarkan"
      widthClassName="max-w-[560px]"
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={autoPrint ? "primary" : "outline"}
            disabled={saving}
            onClick={() => void submit(true)}
          >
            <Printer className="size-4" />
            {saving ? "Menyimpan..." : "Simpan & Cetak resi"}
          </Button>
          <Button
            variant={autoPrint ? "outline" : "primary"}
            disabled={saving}
            onClick={() => void submit(false)}
          >
            {saving ? "Menyimpan..." : "Simpan tanpa cetak resi"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4" onKeyDown={handleKeyDown}>
        <div className="grid grid-cols-[110px_1fr] items-start gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-foreground">
              No. Order
            </span>
            <div
              aria-readonly="true"
              className="flex h-10 items-center rounded-control border border-line bg-surface px-3 text-sm font-bold tabular-nums text-foreground"
            >
              {orderLabel}
            </div>
          </div>
          <Input
            label="Nama customer"
            required
            autoFocus
            placeholder="Contoh: Budi"
            value={customer}
            error={customerError}
            onChange={(event) => {
              setCustomer(event.target.value);
              setCustomerError("");
            }}
          />
        </div>

        <div className="flex items-center justify-between rounded-card bg-primary-soft px-4 py-3">
          <span className="text-[13px] text-foreground">
            Total yang harus dibayar:
          </span>
          <span className="text-xl font-bold tabular-nums text-primary">
            {formatRupiah(total)}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-foreground">
            Metode pembayaran
          </span>
          <div className="grid grid-cols-3 gap-3">
            {METHODS.map(({ value, label, icon: Icon }) => {
              const active = method === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setMethod(value);
                    setPaidError("");
                  }}
                  className={cn(
                    "flex h-12 items-center justify-center gap-2 rounded-control border bg-card text-[13px] font-semibold transition active:scale-[0.98]",
                    active
                      ? "border-2 border-primary text-primary"
                      : "border-line text-muted hover:bg-surface",
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Input
            label="Jumlah bayar"
            inputMode="numeric"
            readOnly={!isCash}
            value={formatRupiah(effectivePaid)}
            error={paidError}
            helper={
              isCash
                ? undefined
                : "Pembayaran non-tunai: jumlah bayar otomatis sama dengan total"
            }
            onChange={(event) => {
              setPaid(parseRupiah(event.target.value));
              setPaidError("");
            }}
          />
          {isCash && (
            <p
              className={cn(
                "text-xs font-medium tabular-nums",
                change >= 0 ? "text-success" : "text-danger",
              )}
            >
              {change >= 0
                ? `Kembalian: ${formatRupiah(change)}`
                : `Kurang: ${formatRupiah(-change)}`}
            </p>
          )}
          <div className="grid grid-cols-4 gap-2">
            {QUICK_AMOUNTS.map((amount) => (
              <Button
                key={amount}
                variant="outline-neutral"
                size="sm"
                disabled={!isCash}
                onClick={() => {
                  setPaid(amount);
                  setPaidError("");
                }}
                className={cn(
                  isCash && paid === amount && "border-primary text-primary",
                )}
              >
                {formatRupiah(amount)}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
