"use client";

import { useCallback, useState } from "react";
import { Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { fetchUsers } from "@/lib/db/users";
import { useDemoReset } from "@/lib/demo/use-demo-reset";
import { toDateInputValue } from "@/lib/format";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/store/toast-store";
import { SettingsCard } from "./settings-card";

export function DataTab() {
  const resetDemo = useDemoReset();
  const [exporting, setExporting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const closeConfirm = useCallback(() => setConfirmOpen(false), []);

  async function exportData() {
    if (exporting) return;
    setExporting(true);

    try {
      const state = useAppStore.getState();
      const users = await fetchUsers();

      const payload = {
        exportedAt: new Date().toISOString(),
        products: state.products,
        transactions: state.transactions,
        expenses: state.expenses,
        settings: state.settings,
        users,
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pos-demo-data-${toDateInputValue(new Date())}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);

      toast.success("Data berhasil diekspor");
    } catch {
      toast.error("Data gagal diekspor. Coba lagi.");
    } finally {
      setExporting(false);
    }
  }

  async function confirmReset() {
    setConfirmOpen(false);
    await resetDemo();
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <SettingsCard title="Ekspor data">
          <p className="text-[13px] text-muted">
            Unduh data demo (barang, transaksi, pengeluaran, pengaturan, dan
            daftar pengguna) sebagai file JSON. Kata sandi tidak ikut diekspor.
          </p>
          <div>
            <Button
              variant="outline"
              disabled={exporting}
              onClick={() => void exportData()}
            >
              <Download className="size-4" />
              {exporting ? "Menyiapkan..." : "Ekspor data"}
            </Button>
          </div>
        </SettingsCard>

        <SettingsCard title="Reset data demo">
          <p className="text-[13px] text-muted">
            Mengembalikan semua data ke data contoh awal. Transaksi,
            pengeluaran, perubahan barang, pengguna, dan pengaturan yang Anda
            buat akan hilang.
          </p>
          <div>
            <Button
              variant="outline-danger"
              onClick={() => setConfirmOpen(true)}
            >
              <RotateCcw className="size-4" />
              Reset data demo
            </Button>
          </div>
        </SettingsCard>
      </div>

      <ConfirmModal
        open={confirmOpen}
        onClose={closeConfirm}
        onConfirm={() => void confirmReset()}
        title="Reset Data Demo"
        message="Semua data akan dikembalikan ke data contoh awal dan tidak bisa dibatalkan. Lanjutkan?"
        confirmLabel="Reset"
      />
    </>
  );
}
