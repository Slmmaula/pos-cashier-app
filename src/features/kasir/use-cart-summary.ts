"use client";

import { useMemo } from "react";
import { computeTotals } from "@/lib/calc";
import type { Product } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { useCartStore } from "@/store/cart-store";

export type CartItem = {
  product: Product;
  qty: number;
  subtotal: number;
};

export function useCartSummary() {
  const products = useAppStore((s) => s.products);
  const settings = useAppStore((s) => s.settings);
  const lines = useCartStore((s) => s.lines);
  const discountType = useCartStore((s) => s.discountType);
  const discountValue = useCartStore((s) => s.discountValue);
  const ppnOverride = useCartStore((s) => s.ppnOverride);
  const method = useCartStore((s) => s.method);

  const items = useMemo<CartItem[]>(
    () =>
      lines.flatMap((line) => {
        const product = products.find((p) => p.id === line.productId);
        return product
          ? [
              {
                product,
                qty: line.qty,
                subtotal: product.sellPrice * line.qty,
              },
            ]
          : [];
      }),
    [lines, products],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.subtotal, 0),
    [items],
  );

  const ppnEnabled = ppnOverride ?? settings.ppnDefault;

  const totals = useMemo(
    () =>
      computeTotals({
        subtotal,
        discountType,
        discountValue,
        maxDiscountPercent: settings.maxDiscount,
        ppnEnabled,
        ppnRate: settings.ppnRate,
        rounding: settings.rounding,
      }),
    [
      subtotal,
      discountType,
      discountValue,
      settings.maxDiscount,
      settings.ppnRate,
      settings.rounding,
      ppnEnabled,
    ],
  );

  const capAmount = Math.round((subtotal * settings.maxDiscount) / 100);
  const discountCapped =
    discountValue > 0 &&
    (discountType === "percent"
      ? discountValue > settings.maxDiscount
      : discountValue > capAmount);

  return {
    items,
    totals,
    method,
    discountType,
    discountValue,
    discountCapped,
    ppnEnabled,
    ppnRate: settings.ppnRate,
    maxDiscount: settings.maxDiscount,
  };
}
