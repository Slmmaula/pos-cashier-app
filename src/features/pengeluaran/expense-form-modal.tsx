"use client";

import { useEffect, useState } from "react";
import { File as FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FileUploadBox,
  type UploadedFile,
} from "@/components/ui/file-upload-box";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { downscaleImage } from "@/lib/attachment";
import { getAttachmentUrl } from "@/lib/db/expenses";
import { EXPENSE_CATEGORIES } from "@/lib/expense";
import { formatRupiah, toDateInputValue } from "@/lib/format";
import type { Expense, ExpenseCategory } from "@/lib/types";
import { useAppStore, type ExpenseInput } from "@/store/app-store";
import { toast } from "@/store/toast-store";

type FormState = {
  date: string;
  category: ExpenseCategory | "";
  description: string;
  amount: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

type NewFile = { blob: Blob; name: string; type: string };

const REQUIRED = "Wajib diisi";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
}

function buildDate(value: string, base: Date): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, base.getHours(), base.getMinutes());
}

function initialState(expense: Expense | null): FormState {
  if (!expense) {
    return { date: "", category: "", description: "", amount: "" };
  }
  return {
    date: toDateInputValue(expense.date),
    category: expense.category,
    description: expense.description,
    amount: String(expense.amount),
  };
}

type ExpenseFormModalProps = {
  open: boolean;
  onClose: () => void;
  /** null = tambah baru */
  expense: Expense | null;
};

export function ExpenseFormModal({
  open,
  onClose,
  expense,
}: ExpenseFormModalProps) {
  const isEdit = expense !== null;
  const [form, setForm] = useState<FormState>(() => initialState(expense));
  const [errors, setErrors] = useState<Errors>({});
  // Lampiran lama tampil dulu sebagai nama file, lalu pratinjau muncul setelah tautan siap
  const [attachment, setAttachment] = useState<UploadedFile | null>(() =>
    expense?.attachment
      ? {
          name: expense.attachment.name,
          type: "application/octet-stream",
          dataUrl: "",
        }
      : null,
  );
  const [newFile, setNewFile] = useState<NewFile | null>(null);
  const [attachmentError, setAttachmentError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const existing = expense?.attachment;
    if (!existing) return;

    let cancelled = false;
    void getAttachmentUrl(existing.dataUrl).then((url) => {
      if (cancelled || !url) return;
      setAttachment((current) =>
        current && current.dataUrl === ""
          ? { name: existing.name, type: existing.type, dataUrl: url }
          : current,
      );
    });
    return () => {
      cancelled = true;
    };
  }, [expense]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleAttachment(file: UploadedFile | null) {
    setAttachmentError("");
    if (!file) {
      setAttachment(null);
      setNewFile(null);
      return;
    }
    try {
      if (file.type.startsWith("image/")) {
        const dataUrl = await downscaleImage(file.dataUrl);
        const blob = await (await fetch(dataUrl)).blob();
        setAttachment({ name: file.name, type: "image/jpeg", dataUrl });
        setNewFile({ blob, name: file.name, type: "image/jpeg" });
      } else {
        const blob = await (await fetch(file.dataUrl)).blob();
        setAttachment(file);
        setNewFile({ blob, name: file.name, type: "application/pdf" });
      }
    } catch {
      setAttachmentError("Lampiran gagal diproses");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const next: Errors = {};
    if (!form.date) next.date = REQUIRED;
    if (!form.category) next.category = REQUIRED;
    if (form.amount === "") next.amount = REQUIRED;
    else if (Number(form.amount) <= 0)
      next.amount = "Nominal harus lebih dari 0";

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    let dateIso: string;
    if (expense && form.date === toDateInputValue(expense.date)) {
      dateIso = expense.date;
    } else {
      const base = expense ? new Date(expense.date) : new Date();
      dateIso = buildDate(form.date, base).toISOString();
    }

    const input: ExpenseInput = {
      date: dateIso,
      category: form.category as ExpenseCategory,
      description: form.description.trim(),
      amount: Number(form.amount),
      newAttachment: newFile ?? undefined,
      removeAttachment: !attachment && Boolean(expense?.attachment),
    };

    setSaving(true);
    const store = useAppStore.getState();
    const result = expense
      ? await store.updateExpense(expense.id, input)
      : await store.addExpense(input);
    setSaving(false);

    if (!result.ok) {
      toast.error(result.error);
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
      title={isEdit ? "Edit Pengeluaran" : "Tambah Pengeluaran Baru"}
      subtitle="Catat pengeluaran operasional toko"
      widthClassName="max-w-[520px]"
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" form="expense-form" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      }
    >
      <form
        id="expense-form"
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        <Input
          label="Tanggal"
          required
          type="date"
          value={form.date}
          error={errors.date}
          onChange={(e) => set("date", e.target.value)}
          className="dark:[color-scheme:dark]"
        />

        <Select
          label="Kategori"
          required
          placeholder="Pilih kategori"
          value={form.category}
          error={errors.category}
          onChange={(e) =>
            set("category", e.target.value as ExpenseCategory | "")
          }
          options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))}
        />

        <Textarea
          label="Deskripsi (opsional)"
          placeholder="Deskripsi singkat pengeluaran (opsional)"
          rows={4}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />

        <Input
          label="Nominal pengeluaran (Rp)"
          required
          inputMode="numeric"
          placeholder="Rp 0"
          value={form.amount === "" ? "" : formatRupiah(Number(form.amount))}
          error={errors.amount}
          onChange={(e) => set("amount", digitsOnly(e.target.value))}
        />

        <FileUploadBox
          label="Lampiran (opsional)"
          icon={FileIcon}
          accept={["image/jpeg", "image/png", "application/pdf"]}
          hints={["Format: JPG, PNG, atau PDF", "Ukuran maksimal: 2MB"]}
          value={attachment}
          onChange={handleAttachment}
          error={attachmentError || undefined}
        />
      </form>
    </Modal>
  );
}
