"use client";

import type { Ref } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Banknote,
  CreditCard,
  Minus,
  Plus,
  QrCode,
  ShoppingCart,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/cn";
import { formatRupiah, formatRupiahTight, parseRupiah } from "@/lib/format";
import type { DiscountType, PaymentMethod } from "@/lib/types";
import { useCartStore } from "@/store/cart-store";
import { useCartSummary } from "./use-cart-summary";

const METHODS: { value: PaymentMethod; label: string; icon: LucideIcon }[] = [
  { value: "Tunai", label: "Tunai", icon: Banknote },
  { value: "QRIS", label: "QRIS", icon: QrCode },
  { value: "Debit", label: "Debit", icon: CreditCard },
];

type PaymentSummaryProps = {
  discountRef: Ref<HTMLInputElement>;
  onPay: () => void;
  className?: string;
};

export function PaymentSummary({
  discountRef,
  onPay,
  className,
}: PaymentSummaryProps) {
  const summary = useCartSummary();
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const setDiscountType = useCartStore((s) => s.setDiscountType);
  const setDiscountValue = useCartStore((s) => s.setDiscountValue);
  const setPpn = useCartStore((s) => s.setPpn);
  const setMethod = useCartStore((s) => s.setMethod);
  const clear = useCartStore((s) => s.clear);

  const { items, totals } = summary;
  const empty = items.length === 0;

  return (
    <section
      className={cn(
        "rounded-card border border-line bg-card shadow-card",
        className,
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-line px-4">
        <h2 className="text-[15px] font-bold text-foreground">
          Ringkasan Pembayaran
        </h2>
        {!empty && <Badge variant="soft">{items.length} Item</Badge>}
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-bold text-foreground">Item Dipilih</p>

          {empty ? (
            <EmptyState icon={ShoppingCart} title="Keranjang masih kosong" />
          ) : (
            <div className="flex max-h-[280px] flex-col gap-2 overflow-y-auto pr-0.5">
              <AnimatePresence initial={false}>
                {items.map(({ product, qty, subtotal }) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="flex items-start justify-between gap-2 rounded-control border border-line bg-surface p-2.5"
                  >
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-[13px] font-semibold leading-[18px] text-foreground">
                        {product.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted">
                        {formatRupiahTight(product.sellPrice)} X{qty}
                      </p>
                      <p className="mt-1 text-[13px] font-bold text-primary">
                        {formatRupiahTight(subtotal)}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          aria-label="Kurangi jumlah"
                          disabled={qty <= 1}
                          onClick={() =>
                            setQty(product.id, qty - 1, product.stock)
                          }
                          className="flex size-5 items-center justify-center rounded text-muted transition hover:bg-line disabled:opacity-40 disabled:hover:bg-transparent"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="min-w-4 text-center text-[13px] font-semibold tabular-nums text-foreground">
                          {qty}
                        </span>
                        <button
                          type="button"
                          aria-label="Tambah jumlah"
                          disabled={qty >= product.stock}
                          onClick={() =>
                            setQty(product.id, qty + 1, product.stock)
                          }
                          className="flex size-5 items-center justify-center rounded text-muted transition hover:bg-line disabled:opacity-40 disabled:hover:bg-transparent"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        aria-label={`Hapus ${product.name} dari keranjang`}
                        onClick={() => remove(product.id)}
                        className="flex size-6 items-center justify-center rounded text-danger transition hover:bg-danger-soft"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 text-[13px]">
          <div className="flex items-center justify-between">
            <span className="text-muted">Sub total</span>
            <span className="font-medium text-foreground tabular-nums">
              {formatRupiah(totals.subtotal)}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Diskon (F7)</span>
              {totals.discountAmount > 0 && (
                <span className="text-muted tabular-nums">
                  -{formatRupiah(totals.discountAmount)}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Select
                aria-label="Jenis diskon"
                wrapperClassName="w-[84px] shrink-0"
                value={summary.discountType}
                onChange={(event) =>
                  setDiscountType(event.target.value as DiscountType)
                }
                options={[
                  { value: "percent", label: "%" },
                  { value: "nominal", label: "Rp" },
                ]}
              />
              <Input
                ref={discountRef}
                aria-label="Nilai diskon"
                inputMode="numeric"
                placeholder="0"
                wrapperClassName="min-w-0 flex-1"
                value={
                  summary.discountValue === 0
                    ? ""
                    : String(summary.discountValue)
                }
                onChange={(event) =>
                  setDiscountValue(parseRupiah(event.target.value))
                }
              />
            </div>
            {summary.discountCapped && (
              <p className="text-xs text-danger">
                Dibatasi diskon maksimal {summary.maxDiscount}% dari sub total
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">
                PPN {summary.ppnRate}%
              </span>
              <span className="font-medium text-foreground tabular-nums">
                {formatRupiah(totals.ppnAmount)}
              </span>
            </div>
            <Toggle
              checked={summary.ppnEnabled}
              onChange={setPpn}
              aria-label="Aktifkan PPN"
            />
          </div>
        </div>

        <div>
          <p className="text-[13px] text-muted">Total pembayaran</p>
          <p className="text-2xl font-bold text-primary tabular-nums">
            {formatRupiah(totals.total)}
          </p>
        </div>

        <div className="rounded-card bg-primary-soft p-3">
          <p className="mb-2 text-xs text-muted">Metode pembayaran:</p>
          <div className="grid grid-cols-3 gap-2">
            {METHODS.map(({ value, label, icon: Icon }) => {
              const active = summary.method === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMethod(value)}
                  aria-pressed={active}
                  className={cn(
                    "flex h-9 items-center justify-center gap-1.5 rounded-control border bg-card text-xs font-semibold transition active:scale-[0.97]",
                    active
                      ? "border-primary text-primary"
                      : "border-line text-muted hover:bg-surface",
                  )}
                >
                  <Icon className="size-3.5" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button disabled={empty} onClick={onPay} className="w-full">
            Bayar (F9)
          </Button>
          <Button
            variant="outline-danger"
            disabled={empty}
            onClick={clear}
            className="w-full"
          >
            <Trash2 className="size-4" />
            Hapus keranjang
          </Button>
        </div>
      </div>
    </section>
  );
}
