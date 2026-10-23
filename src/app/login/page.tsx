"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, controlBase, controlState } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useAuthStore } from "@/store/auth-store";

const DEMO_ACCOUNTS = [
  {
    label: "Owner",
    username: "owner",
    password: "owner123",
    note: "Semua menu",
  },
  {
    label: "Kasir",
    username: "kasir",
    password: "kasir123",
    note: "Kasir, Barang, Riwayat",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [inactiveOpen, setInactiveOpen] = useState(false);

  const closeInactive = useCallback(() => setInactiveOpen(false), []);

  useEffect(() => {
    if (status === "signed-in") router.replace("/kasir");
  }, [status, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    if (!username.trim() || !password) {
      setError("Username dan password wajib diisi");
      return;
    }

    setSubmitting(true);
    const result = await useAuthStore.getState().login(username, password);
    setSubmitting(false);

    if (!result.ok) {
      if (result.reason === "inactive") {
        setError("");
        setPassword("");
        setInactiveOpen(true);
      } else {
        setError(result.error);
      }
      return;
    }

    setError("");
    router.replace("/kasir");
  }

  function fillDemo(account: (typeof DEMO_ACCOUNTS)[number]) {
    setUsername(account.username);
    setPassword(account.password);
    setError("");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-page p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="w-full max-w-[400px] rounded-card border border-line bg-card p-8 shadow-card"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary text-white">
            <ShoppingCart className="size-7" />
          </div>
          <div className="text-center">
            <p className="text-xl font-bold leading-6 text-primary">
              Pos System
            </p>
            <p className="text-[13px] text-muted">Sistem kasir</p>
          </div>
        </div>

        <h1 className="mt-6 text-center text-[22px] font-bold text-foreground">
          Masuk
        </h1>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 flex flex-col gap-4"
        >
          <Input
            label="Username"
            placeholder="Masukkan username"
            autoComplete="username"
            autoCapitalize="none"
            autoFocus
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              setError("");
            }}
          />

          <Field id="login-password" label="Password">
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                className={`${controlBase} ${controlState(error || undefined)} h-10 px-3 pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </Field>

          <div className="min-h-5" aria-live="polite">
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="text-[13px] font-medium text-danger"
              >
                {error}
              </motion.p>
            )}
          </div>

          <Button
            type="submit"
            disabled={status === "loading" || submitting}
            className="w-full"
          >
            {submitting ? "Memeriksa..." : "Masuk"}
          </Button>
        </form>

        <div className="mt-6 rounded-control border border-line bg-surface p-3">
          <p className="text-xs font-bold text-foreground">Akun demo</p>
          <p className="mt-0.5 text-[11px] text-muted">
            Ini versi demo. Data tersimpan di browser Anda saja.
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <li
                key={account.username}
                className="flex items-center justify-between gap-2"
              >
                <div className="min-w-0 text-[11px] leading-4 text-muted">
                  <p className="font-semibold text-foreground">
                    {account.label}{" "}
                    <span className="font-normal text-muted">
                      ({account.note})
                    </span>
                  </p>
                  <p className="tabular-nums">
                    {account.username} / {account.password}
                  </p>
                </div>
                <Button
                  variant="outline-neutral"
                  size="sm"
                  onClick={() => fillDemo(account)}
                >
                  Isi
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      <Modal
        open={inactiveOpen}
        onClose={closeInactive}
        title="Akun Dinonaktifkan"
        widthClassName="max-w-[420px]"
        footer={
          <Button onClick={closeInactive} className="w-full">
            Mengerti
          </Button>
        }
      >
        <p className="text-sm text-foreground">
          Akun Anda telah dinonaktifkan, jadi belum bisa dipakai masuk. Hubungi
          Owner untuk mengaktifkan kembali akun Anda.
        </p>
      </Modal>
    </main>
  );
}
