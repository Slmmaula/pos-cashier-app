"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isStoreInfoComplete } from "@/lib/store-info";
import { useAppStore } from "@/store/app-store";
import { useCartStore } from "@/store/cart-store";
import { toast } from "@/store/toast-store";
import { PaymentModal } from "./payment-modal";
import { PaymentSummary } from "./payment-summary";
import { ProductCatalog } from "./product-catalog";

export function KasirPage() {
  const searchRef = useRef<HTMLInputElement>(null);
  const discountRef = useRef<HTMLInputElement>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [payKey, setPayKey] = useState(0);

  const handlePay = useCallback(() => {
    if (payOpen) return;
    if (useCartStore.getState().lines.length === 0) return;
    if (!isStoreInfoComplete(useAppStore.getState().settings)) {
      toast.error(
        "Informasi toko belum lengkap. Minta Owner melengkapinya di Pengaturan.",
      );
      return;
    }
    setPayKey((key) => key + 1);
    setPayOpen(true);
  }, [payOpen]);

  const closePay = useCallback(() => setPayOpen(false), []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (payOpen) return;
      if (event.key === "F2") {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      } else if (event.key === "F7") {
        event.preventDefault();
        discountRef.current?.focus();
        discountRef.current?.select();
      } else if (event.key === "F9") {
        event.preventDefault();
        handlePay();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlePay, payOpen]);

  return (
    <>
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <ProductCatalog searchRef={searchRef} />
        </div>
        <PaymentSummary
          discountRef={discountRef}
          onPay={handlePay}
          className="sticky top-0 w-[340px] shrink-0"
        />
      </div>

      <PaymentModal key={payKey} open={payOpen} onClose={closePay} />
    </>
  );
}
