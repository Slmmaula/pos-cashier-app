"use client";

import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FileUploadBox,
  type UploadedFile,
} from "@/components/ui/file-upload-box";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { DUPLICATE_CODE_MESSAGE } from "@/lib/db/products";
import { compressImage } from "@/lib/image";
import { formatRupiah } from "@/lib/format";
import type { Category, Product } from "@/lib/types";
import { useAppStore, type ProductInput } from "@/store/app-store";
import { toast } from "@/store/toast-store";

const CATEGORY_OPTIONS: Category[] = ["Makanan", "Minuman", "Lainnya"];
const BASE_UNITS = ["Pcs", "Botol", "Cup", "Pack", "Box"];

type FormState = {
  name: string;
  code: string;
  barcode: string;
  description: string;
  category: Category | "";
  unit: string;
  buyPrice: string;
  sellPrice: string;
  stock: string;
  minStock: string;
  active: boolean;
};

type Errors = Partial<Record<keyof FormState, string>>;

const REQUIRED = "Wajib diisi";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
}

function initialState(product: Product | null): FormState {
  if (!product) {
    return {
      name: "",
      code: "",
      barcode: "",
      description: "",
      category: "",
      unit: "",
      buyPrice: "",
      sellPrice: "",
      stock: "",
      minStock: "",
      active: true,
    };
  }
  return {
    name: product.name,
    code: product.code,
    barcode: product.barcode,
    description: product.description,
    category: product.category,
    unit: product.unit,
    buyPrice: String(product.buyPrice),
    sellPrice: String(product.sellPrice),
    stock: String(product.stock),
    minStock: String(product.minStock),
    active: product.active,
  };
}

function money(value: string): string {
  return value === "" ? "" : formatRupiah(Number(value));
}

type ProductFormModalProps = {
  open: boolean;
  onClose: () => void;
  product: Product | null;
};

export function ProductFormModal({
  open,
  onClose,
  product,
}: ProductFormModalProps) {
  const isEdit = product !== null;
  const [form, setForm] = useState<FormState>(() => initialState(product));
  const [errors, setErrors] = useState<Errors>({});
  const [image, setImage] = useState<UploadedFile | null>(() =>
    product?.image
      ? { name: "Gambar produk", type: "image/jpeg", dataUrl: product.image }
      : null,
  );
  const [newImage, setNewImage] = useState<Blob | null>(null);
  const [imageError, setImageError] = useState("");
  const [saving, setSaving] = useState(false);

  const unitOptions = Array.from(
    new Set([...BASE_UNITS, ...(product ? [product.unit] : [])]),
  ).map((unit) => ({ value: unit, label: unit }));

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleImage(file: UploadedFile | null) {
    setImageError("");
    if (!file) {
      setImage(null);
      setNewImage(null);
      return;
    }
    try {
      const dataUrl = await compressImage(file.dataUrl);
      const blob = await (await fetch(dataUrl)).blob();
      setImage({ name: file.name, type: "image/jpeg", dataUrl });
      setNewImage(blob);
    } catch {
      setImageError("Gambar gagal diproses");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const next: Errors = {};
    if (!form.name.trim()) next.name = REQUIRED;
    if (!form.code.trim()) next.code = REQUIRED;
    if (!form.category) next.category = REQUIRED;
    if (!form.unit) next.unit = REQUIRED;
    if (form.buyPrice === "") next.buyPrice = REQUIRED;
    if (form.sellPrice === "") next.sellPrice = REQUIRED;
    if (form.stock === "") next.stock = REQUIRED;
    if (form.minStock === "") next.minStock = REQUIRED;

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    const input: ProductInput = {
      name: form.name.trim(),
      code: form.code.trim(),
      barcode: form.barcode.trim(),
      description: form.description.trim(),
      category: form.category as Category,
      unit: form.unit,
      buyPrice: Number(form.buyPrice),
      sellPrice: Number(form.sellPrice),
      stock: Number(form.stock),
      minStock: Number(form.minStock),
      active: form.active,
      newImage: newImage ?? undefined,
      removeImage: !image && Boolean(product?.image),
    };

    setSaving(true);
    const store = useAppStore.getState();
    const result = product
      ? await store.updateProduct(product.id, input)
      : await store.addProduct(input);
    setSaving(false);

    if (!result.ok) {
      if (result.error === DUPLICATE_CODE_MESSAGE) {
        setErrors({ code: result.error });
      } else {
        toast.error(result.error);
      }
      return;
    }

    onClose();
    toast.success(
      isEdit ? "Data berhasil diperbarui" : "Data berhasil ditambahkan",
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Barang" : "Tambah Barang Baru"}
      subtitle={isEdit ? "Ubah detail barang" : "Masukkan detail barang baru"}
      widthClassName="max-w-[520px]"
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" form="product-form" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      }
    >
      <form
        id="product-form"
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        <Input
          label="Nama barang"
          required
          placeholder="Contoh: Barang A"
          value={form.name}
          error={errors.name}
          onChange={(e) => set("name", e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Kode barang"
            required
            placeholder="Contoh: BRG-001"
            value={form.code}
            error={errors.code}
            onChange={(e) => set("code", e.target.value)}
          />
          <Input
            label="Barcode (opsional)"
            placeholder="Contoh: 00000000"
            value={form.barcode}
            onChange={(e) => set("barcode", e.target.value)}
          />
        </div>

        <Textarea
          label="Deskripsi (opsional)"
          placeholder="Deskripsi singkat barang (opsional)"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />

        <FileUploadBox
          label="Gambar produk (opsional)"
          icon={ImageIcon}
          accept={["image/jpeg", "image/png", "image/gif"]}
          hints={[
            "Format: JPG, PNG, atau GIF",
            "Ukuran maksimal: 2MB",
            "Rasio: 1:1 (persegi)",
          ]}
          value={image}
          onChange={handleImage}
          error={imageError || undefined}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Kategori"
            required
            placeholder="Pilih kategori"
            value={form.category}
            error={errors.category}
            onChange={(e) => set("category", e.target.value as Category | "")}
            options={CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))}
          />
          <Select
            label="Satuan"
            required
            placeholder="Pilih satuan"
            value={form.unit}
            error={errors.unit}
            onChange={(e) => set("unit", e.target.value)}
            options={unitOptions}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Harga beli (Rp)"
            required
            inputMode="numeric"
            placeholder="Rp 0"
            value={money(form.buyPrice)}
            error={errors.buyPrice}
            onChange={(e) => set("buyPrice", digitsOnly(e.target.value))}
          />
          <Input
            label="Harga jual (Rp)"
            required
            inputMode="numeric"
            placeholder="Rp 0"
            value={money(form.sellPrice)}
            error={errors.sellPrice}
            onChange={(e) => set("sellPrice", digitsOnly(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Stok awal"
            required
            inputMode="numeric"
            placeholder="0"
            value={form.stock}
            error={errors.stock}
            onChange={(e) => set("stock", digitsOnly(e.target.value))}
          />
          <Input
            label="Minimum stok"
            required
            inputMode="numeric"
            placeholder="0"
            value={form.minStock}
            error={errors.minStock}
            onChange={(e) => set("minStock", digitsOnly(e.target.value))}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-foreground">
            Status aktif
          </span>
          <Toggle
            checked={form.active}
            onChange={(value) => set("active", value)}
            aria-label="Status aktif"
          />
        </div>
      </form>
    </Modal>
  );
}
