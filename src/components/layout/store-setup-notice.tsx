"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { isStoreInfoComplete } from "@/lib/store-info";
import { useAppStore } from "@/store/app-store";
import { useAuthStore } from "@/store/auth-store";

export function StoreSetupNotice() {
  const router = useRouter();
  const pathname = usePathname();
  const settings = useAppStore((state) => state.settings);
  const isOwner = useAuthStore((state) => state.profile?.role === "Owner");
  const [dismissed, setDismissed] = useState(false);

  const close = useCallback(() => setDismissed(true), []);

  if (isStoreInfoComplete(settings)) return null;

  const onSettings = pathname.startsWith("/pengaturan");

  function goToSettings() {
    setDismissed(true);
    router.push("/pengaturan");
  }

  return (
    <>
      {!onSettings && (
        <div className="mx-6 mb-3 flex shrink-0 items-center justify-between gap-3 rounded-control border border-warning-border bg-warning-bg px-4 py-3 text-[13px] font-medium text-warning-text">
          <span className="flex items-center gap-2">
            <Store className="size-4 shrink-0" />
            {isOwner
              ? "Informasi toko belum lengkap. Lengkapi di Pengaturan > Profil Toko sebelum toko mulai beroperasi."
              : "Toko belum siap beroperasi. Hubungi Owner untuk melengkapi informasi toko."}
          </span>
          {isOwner && (
            <Button variant="outline-neutral" size="sm" onClick={goToSettings}>
              Lengkapi
            </Button>
          )}
        </div>
      )}

      {isOwner && (
        <Modal
          open={!dismissed && !onSettings}
          onClose={close}
          title="Lengkapi Informasi Toko"
          widthClassName="max-w-[440px]"
          footer={
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={close}>
                Nanti
              </Button>
              <Button onClick={goToSettings}>Lengkapi sekarang</Button>
            </div>
          }
        >
          <p className="text-sm text-foreground">
            Sebelum toko mulai beroperasi, lengkapi dulu nama toko, alamat
            lengkap, nomor telepon, dan nomor WhatsApp. Data ini dipakai di
            struk. Selama belum lengkap, transaksi di Kasir belum bisa disimpan.
          </p>
        </Modal>
      )}
    </>
  );
}
