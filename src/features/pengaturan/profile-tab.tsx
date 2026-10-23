"use client";

import { useState } from "react";
import { File as FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FileUploadBox,
  type UploadedFile,
} from "@/components/ui/file-upload-box";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { downscaleImage } from "@/lib/attachment";
import { isStoreInfoComplete } from "@/lib/store-info";
import type { Settings, StoredFile } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/store/toast-store";
import { SettingsCard } from "./settings-card";

type Draft = {
  storeName: string;
  address: string;
  phone: string;
  whatsapp: string;
  npwp: string;
  logo: StoredFile | null;
};

type Errors = Partial<
  Record<"storeName" | "address" | "phone" | "whatsapp", string>
>;

type NewLogo = { blob: Blob; type: string };

const REQUIRED = "Wajib diisi";
const MAX_SVG_LENGTH = 300_000;

function fromSettings(s: Settings): Draft {
  return {
    storeName: s.storeName,
    address: s.address,
    phone: s.phone,
    whatsapp: s.whatsapp,
    npwp: s.npwp,
    logo: s.logo,
  };
}

function normalize(d: Draft): Draft {
  return {
    storeName: d.storeName.trim(),
    address: d.address.trim(),
    phone: d.phone.trim(),
    whatsapp: d.whatsapp.trim(),
    npwp: d.npwp.trim(),
    logo: d.logo,
  };
}

function sameText(a: Draft, b: Draft): boolean {
  return (
    a.storeName === b.storeName &&
    a.address === b.address &&
    a.phone === b.phone &&
    a.whatsapp === b.whatsapp &&
    a.npwp === b.npwp
  );
}

export function ProfileTab() {
  const settings = useAppStore((s) => s.settings);
  const [draft, setDraft] = useState<Draft>(() => fromSettings(settings));
  const [newLogo, setNewLogo] = useState<NewLogo | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [logoError, setLogoError] = useState("");
  const [saving, setSaving] = useState(false);

  const removedLogo = draft.logo === null && settings.logo !== null;
  const dirty =
    !sameText(normalize(draft), fromSettings(settings)) ||
    newLogo !== null ||
    removedLogo;
  const incomplete = !isStoreInfoComplete(settings);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleLogo(file: UploadedFile | null) {
    setLogoError("");
    if (!file) {
      setDraft((prev) => ({ ...prev, logo: null }));
      setNewLogo(null);
      return;
    }
    try {
      if (file.type === "image/svg+xml") {
        if (file.dataUrl.length > MAX_SVG_LENGTH) {
          setLogoError("SVG terlalu besar (maks. sekitar 200KB)");
          return;
        }
        const blob = await (await fetch(file.dataUrl)).blob();
        setDraft((prev) => ({
          ...prev,
          logo: {
            name: file.name,
            type: "image/svg+xml",
            dataUrl: file.dataUrl,
          },
        }));
        setNewLogo({ blob, type: "image/svg+xml" });
      } else {
        const dataUrl = await downscaleImage(file.dataUrl, 400);
        const blob = await (await fetch(dataUrl)).blob();
        setDraft((prev) => ({
          ...prev,
          logo: { name: file.name, type: "image/jpeg", dataUrl },
        }));
        setNewLogo({ blob, type: "image/jpeg" });
      }
    } catch {
      setLogoError("Logo gagal diproses");
    }
  }

  async function save() {
    if (saving) return;

    const next = normalize(draft);
    const found: Errors = {};
    if (!next.storeName) found.storeName = REQUIRED;
    if (!next.address) found.address = REQUIRED;
    if (!next.phone) found.phone = REQUIRED;
    if (!next.whatsapp) found.whatsapp = REQUIRED;

    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setSaving(true);
    const result = await useAppStore.getState().updateSettings({
      storeName: next.storeName,
      address: next.address,
      phone: next.phone,
      whatsapp: next.whatsapp,
      npwp: next.npwp,
      newLogo: newLogo ?? undefined,
      removeLogo: removedLogo,
    });
    setSaving(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    setNewLogo(null);
    setDraft(fromSettings(useAppStore.getState().settings));
    toast.success("Perubahan berhasil disimpan");
  }

  return (
    <div className="flex flex-col gap-4">
      {incomplete && (
        <div className="rounded-control border border-warning-border bg-warning-bg px-4 py-3 text-[13px] font-medium text-warning-text">
          Lengkapi nama toko, alamat, telepon, dan WhatsApp (kolom bertanda *)
          sebelum toko mulai beroperasi.
        </div>
      )}

      <SettingsCard title="Informasi Toko">
        <Input
          label="Nama toko"
          required
          placeholder="Contoh: Xyz Caffe & Resto"
          value={draft.storeName}
          error={errors.storeName}
          onChange={(e) => set("storeName", e.target.value)}
        />
        <Textarea
          label="Alamat lengkap"
          required
          rows={4}
          placeholder="Contoh: Jl. Merdeka Kendala, KM.14.C"
          value={draft.address}
          error={errors.address}
          onChange={(e) => set("address", e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Nomor telepon"
            required
            inputMode="tel"
            placeholder="+62"
            value={draft.phone}
            error={errors.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
          <Input
            label="Nomor WhatsApp"
            required
            inputMode="tel"
            placeholder="+62"
            value={draft.whatsapp}
            error={errors.whatsapp}
            onChange={(e) => set("whatsapp", e.target.value)}
          />
        </div>
        <Input
          label="NPWP (opsional)"
          placeholder="Contoh: 01.000.000.000"
          value={draft.npwp}
          onChange={(e) => set("npwp", e.target.value)}
        />
        <FileUploadBox
          label="Logo toko (opsional)"
          icon={FileIcon}
          accept={["image/jpeg", "image/png", "image/svg+xml"]}
          hints={["Format: JPG, PNG, atau SVG", "Ukuran maksimal: 2MB"]}
          value={draft.logo}
          onChange={handleLogo}
          error={logoError || undefined}
        />
      </SettingsCard>

      <div>
        <Button disabled={!dirty || saving} onClick={() => void save()}>
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </div>
  );
}
