"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { isValidTrxFormat, makeTrxNo } from "@/lib/order";
import type { PaperSize, Rounding, Transaction } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { useAuthStore } from "@/store/auth-store";
import { usePrintStore } from "@/store/print-store";
import { toast } from "@/store/toast-store";
import { SettingsCard, ToggleBox } from "./settings-card";

const ROUNDING_OPTIONS = [
  { value: "none", label: "Tidak ada pembulatan" },
  { value: "100", label: "Bulatkan ke Rp 100" },
  { value: "500", label: "Bulatkan ke Rp 500" },
  { value: "1000", label: "Bulatkan ke Rp 1.000" },
];

const PAPER_OPTIONS = [
  { value: "58mm", label: "Thermal 58mm" },
  { value: "80mm", label: "Thermal 80mm" },
  { value: "88mm", label: "Thermal 88mm" },
];

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
}

function TaxCard() {
  const settings = useAppStore((s) => s.settings);
  const [ppnDefault, setPpnDefault] = useState(settings.ppnDefault);
  const [maxDiscount, setMaxDiscount] = useState(String(settings.maxDiscount));
  const [rounding, setRounding] = useState<Rounding>(settings.rounding);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const dirty =
    ppnDefault !== settings.ppnDefault ||
    maxDiscount !== String(settings.maxDiscount) ||
    rounding !== settings.rounding;

  async function save() {
    if (saving) return;
    if (maxDiscount === "") {
      setError("Wajib diisi");
      return;
    }
    if (Number(maxDiscount) > 100) {
      setError("Diskon maksimal tidak boleh lebih dari 100%");
      return;
    }

    setSaving(true);
    const result = await useAppStore.getState().updateSettings({
      ppnDefault,
      maxDiscount: Number(maxDiscount),
      rounding,
    });
    setSaving(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Pengaturan pajak berhasil disimpan");
  }

  return (
    <SettingsCard title="Pengaturan Pajak">
      <ToggleBox
        title={`PPN ${settings.ppnRate}%`}
        description="Aktifkan PPN secara default pada transaksi baru"
        checked={ppnDefault}
        onChange={setPpnDefault}
      />
      <Input
        label="Diskon Maksimal (%)"
        inputMode="numeric"
        placeholder="Contoh: 50"
        helper="Batas maksimal diskon yang bisa diberikan kasir"
        value={maxDiscount}
        error={error}
        onChange={(e) => {
          setMaxDiscount(digitsOnly(e.target.value));
          setError("");
        }}
      />
      <Select
        label="Pembulatan Harga"
        value={rounding}
        onChange={(e) => setRounding(e.target.value as Rounding)}
        options={ROUNDING_OPTIONS}
      />
      <div>
        <Button disabled={!dirty || saving} onClick={() => void save()}>
          {saving ? "Menyimpan..." : "Simpan Pengaturan Pajak"}
        </Button>
      </div>
    </SettingsCard>
  );
}

function NumberCard() {
  const settings = useAppStore((s) => s.settings);
  const [format, setFormat] = useState(settings.trxFormat);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const dirty = format !== settings.trxFormat;
  const valid = isValidTrxFormat(format);

  async function save() {
    if (saving) return;
    if (!valid) {
      setError(
        "Format harus memuat DD, MM, dan YY atau YYYY (pemisah boleh - atau .)",
      );
      return;
    }

    setSaving(true);
    const result = await useAppStore.getState().updateSettings({
      trxFormat: format,
    });
    setSaving(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Format nomor berhasil disimpan");
  }

  return (
    <SettingsCard title="Nomor Dokumen">
      <div className="flex flex-col gap-1.5">
        <Input
          label="Format Nomor Transaksi"
          placeholder="Contoh: DDMMYY"
          helper="(DD) = Tanggal, (MM) = Bulan, (YY) = Tahun 2 digit, (YYYY) = Tahun 4 digit"
          value={format}
          error={error}
          onChange={(e) => {
            setFormat(e.target.value.toUpperCase());
            setError("");
          }}
        />
        {valid && (
          <p className="text-xs text-muted">
            Contoh nomor: {makeTrxNo(new Date(), 1, format)} (tiga digit
            terakhir = No. Order)
          </p>
        )}
      </div>
      <Select
        label="Reset Nomor Urut"
        value="daily"
        disabled
        onChange={() => {}}
        options={[{ value: "daily", label: "Reset setiap hari" }]}
        helper="No. Order selalu dimulai dari 001 setiap hari agar bisa dipakai memanggil customer"
      />
      <div>
        <Button disabled={!dirty || saving} onClick={() => void save()}>
          {saving ? "Menyimpan..." : "Simpan Format Nomor"}
        </Button>
      </div>
    </SettingsCard>
  );
}

function PrinterCard() {
  const settings = useAppStore((s) => s.settings);
  const [paperSize, setPaperSize] = useState<PaperSize>(settings.paperSize);
  const [margin, setMargin] = useState(String(settings.margin));
  const [autoPrint, setAutoPrint] = useState(settings.autoPrint);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const dirty =
    paperSize !== settings.paperSize ||
    margin !== String(settings.margin) ||
    autoPrint !== settings.autoPrint;

  async function save() {
    if (saving) return;
    if (margin === "") {
      setError("Wajib diisi");
      return;
    }
    if (Number(margin) > 20) {
      setError("Margin maksimal 20 mm");
      return;
    }

    setSaving(true);
    const result = await useAppStore.getState().updateSettings({
      paperSize,
      margin: Number(margin),
      autoPrint,
    });
    setSaving(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Pengaturan printer berhasil disimpan");
  }

  function testPrint() {
    const state = useAppStore.getState();
    const now = new Date();
    const sample: Transaction = {
      id: "tes-cetak",
      orderId: 1,
      trxNo: makeTrxNo(now, 1, state.settings.trxFormat),
      createdAt: now.toISOString(),
      cashier: useAuthStore.getState().profile?.name ?? "Kasir",
      customerName: "Tes Cetak",
      items: [
        {
          productId: "tes",
          code: "TES-001",
          name: "Contoh Barang",
          qty: 2,
          price: 10000,
          cost: 6000,
        },
      ],
      subtotal: 20000,
      discountType: "percent",
      discountValue: 0,
      discountAmount: 0,
      ppnEnabled: false,
      ppnAmount: 0,
      roundingAmount: 0,
      total: 20000,
      method: "Tunai",
      paid: 50000,
      change: 30000,
      status: "Lunas",
    };
    usePrintStore.getState().print(sample);
  }

  return (
    <SettingsCard title="Printer">
      <Select
        label="Ukuran Kertas"
        value={paperSize}
        onChange={(e) => setPaperSize(e.target.value as PaperSize)}
        options={PAPER_OPTIONS}
      />
      <Input
        label="Margin (mm)"
        inputMode="numeric"
        placeholder="Contoh: 5"
        value={margin}
        error={error}
        onChange={(e) => {
          setMargin(digitsOnly(e.target.value));
          setError("");
        }}
      />
      <ToggleBox
        title="Cetak Otomatis"
        description="Cetak struk secara otomatis setelah pembayaran"
        checked={autoPrint}
        onChange={setAutoPrint}
        note="Menentukan tombol bawaan (tekan Enter) di popup Pembayaran."
      />
      <div className="flex gap-3">
        <Button disabled={!dirty || saving} onClick={() => void save()}>
          {saving ? "Menyimpan..." : "Simpan Pengaturan Printer"}
        </Button>
        <Button variant="outline" onClick={testPrint}>
          Tes Cetak
        </Button>
      </div>
      {dirty && (
        <p className="-mt-2 text-xs text-muted">
          Tes Cetak memakai pengaturan yang sudah tersimpan.
        </p>
      )}
    </SettingsCard>
  );
}

export function ReceiptTab() {
  return (
    <div className="flex flex-col gap-4">
      <TaxCard />
      <NumberCard />
      <PrinterCard />
    </div>
  );
}
