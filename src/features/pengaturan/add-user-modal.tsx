"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PasswordInput } from "@/components/ui/password-input";
import { Select } from "@/components/ui/select";
import { USERNAME_PATTERN, normalizeUsername } from "@/lib/auth";
import { createUserAccount, type ManagedUser } from "@/lib/db/users";
import type { UserRole } from "@/lib/types";
import { toast } from "@/store/toast-store";

type Errors = Partial<
  Record<"name" | "username" | "role" | "password" | "confirm", string>
>;

const REQUIRED = "Wajib diisi";

type AddUserModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (user: ManagedUser) => void;
};

export function AddUserModal({ open, onClose, onCreated }: AddUserModalProps) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  function clear(key: keyof Errors) {
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const next: Errors = {};
    const cleanName = name.trim();
    const cleanUsername = normalizeUsername(username);

    if (!cleanName) next.name = REQUIRED;
    if (!cleanUsername) next.username = REQUIRED;
    else if (!USERNAME_PATTERN.test(cleanUsername)) {
      next.username =
        "3-30 karakter: huruf kecil, angka, titik, garis bawah, atau strip";
    }
    if (!role) next.role = REQUIRED;
    if (!password) next.password = REQUIRED;
    else if (password.length < 8) next.password = "Minimal 8 karakter";
    if (!confirm) next.confirm = REQUIRED;
    else if (confirm !== password) next.confirm = "Kata sandi tidak sama";

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    setSaving(true);
    const result = await createUserAccount({
      name: cleanName,
      username: cleanUsername,
      password,
      role: role as UserRole,
    });
    setSaving(false);

    if (!result.ok) {
      if (result.error.startsWith("Username")) {
        setErrors({ username: result.error });
      } else {
        toast.error(result.error);
      }
      return;
    }

    onCreated(result.data);
    onClose();
    toast.success("Pengguna berhasil ditambahkan");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tambah Pengguna"
      subtitle="Buat akun baru untuk Owner atau Kasir"
      widthClassName="max-w-[480px]"
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" form="add-user-form" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      }
    >
      <form
        id="add-user-form"
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        <Input
          label="Nama"
          required
          placeholder="Contoh: Budi Santoso"
          autoFocus
          value={name}
          error={errors.name}
          onChange={(e) => {
            setName(e.target.value);
            clear("name");
          }}
        />
        <Input
          label="Username"
          required
          placeholder="Contoh: budi"
          autoCapitalize="none"
          autoComplete="off"
          helper="Dipakai untuk login. Huruf kecil, angka, titik, garis bawah, atau strip."
          value={username}
          error={errors.username}
          onChange={(e) => {
            setUsername(e.target.value);
            clear("username");
          }}
        />
        <Select
          label="Peran"
          required
          placeholder="Pilih peran"
          value={role}
          error={errors.role}
          onChange={(e) => {
            setRole(e.target.value as UserRole | "");
            clear("role");
          }}
          options={[
            { value: "Kasir", label: "Kasir" },
            { value: "Owner", label: "Owner" },
          ]}
          helper="Owner dapat mengakses semua menu. Kasir hanya Kasir, Riwayat, dan melihat Barang."
        />
        <PasswordInput
          label="Kata sandi"
          required
          autoComplete="new-password"
          placeholder="Minimal 8 karakter"
          value={password}
          error={errors.password}
          onChange={(e) => {
            setPassword(e.target.value);
            clear("password");
          }}
        />
        <PasswordInput
          label="Ulangi kata sandi"
          required
          autoComplete="new-password"
          placeholder="Ketik ulang kata sandi"
          value={confirm}
          error={errors.confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            clear("confirm");
          }}
        />
      </form>
    </Modal>
  );
}
