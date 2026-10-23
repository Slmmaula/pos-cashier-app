"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PasswordInput } from "@/components/ui/password-input";
import { resetUserPassword, type ManagedUser } from "@/lib/db/users";
import { toast } from "@/store/toast-store";

type ResetPasswordModalProps = {
  open: boolean;
  onClose: () => void;
  user: ManagedUser | null;
};

export function ResetPasswordModal({
  open,
  onClose,
  user,
}: ResetPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || !user) return;

    let invalid = false;
    if (!password) {
      setPasswordError("Wajib diisi");
      invalid = true;
    } else if (password.length < 8) {
      setPasswordError("Minimal 8 karakter");
      invalid = true;
    }
    if (!confirm) {
      setConfirmError("Wajib diisi");
      invalid = true;
    } else if (confirm !== password) {
      setConfirmError("Kata sandi tidak sama");
      invalid = true;
    }
    if (invalid) return;

    setSaving(true);
    const result = await resetUserPassword(user.id, password);
    setSaving(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    onClose();
    toast.success("Kata sandi berhasil diubah");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reset Kata Sandi"
      subtitle={
        user
          ? `Atur kata sandi baru untuk ${user.name} (${user.username})`
          : undefined
      }
      widthClassName="max-w-[440px]"
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" form="reset-password-form" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      }
    >
      <form
        id="reset-password-form"
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        <PasswordInput
          label="Kata sandi baru"
          required
          autoComplete="new-password"
          autoFocus
          placeholder="Minimal 8 karakter"
          value={password}
          error={passwordError}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordError("");
          }}
        />
        <PasswordInput
          label="Ulangi kata sandi baru"
          required
          autoComplete="new-password"
          placeholder="Ketik ulang kata sandi"
          value={confirm}
          error={confirmError}
          onChange={(e) => {
            setConfirm(e.target.value);
            setConfirmError("");
          }}
        />
      </form>
    </Modal>
  );
}
