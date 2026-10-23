"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { Toggle } from "@/components/ui/toggle";
import {
  deleteUserAccount,
  fetchUsers,
  setUserActive,
  type ManagedUser,
} from "@/lib/db/users";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "@/store/toast-store";
import { AddUserModal } from "./add-user-modal";
import { ResetPasswordModal } from "./reset-password-modal";

type Status = "loading" | "ready" | "error";

export function UsersTab() {
  const selfId = useAuthStore((state) => state.profile?.id);

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [reload, setReload] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [addKey, setAddKey] = useState(0);

  const [passwordTarget, setPasswordTarget] = useState<ManagedUser | null>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordKey, setPasswordKey] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchUsers()
      .then((list) => {
        if (cancelled) return;
        setUsers(list);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const closeAdd = useCallback(() => setAddOpen(false), []);
  const closePassword = useCallback(() => setPasswordOpen(false), []);
  const closeDelete = useCallback(() => setDeleteOpen(false), []);

  function openAdd() {
    setAddKey((key) => key + 1);
    setAddOpen(true);
  }

  function openPassword(user: ManagedUser) {
    setPasswordTarget(user);
    setPasswordKey((key) => key + 1);
    setPasswordOpen(true);
  }

  function askDelete(user: ManagedUser) {
    setDeleteTarget(user);
    setDeleteOpen(true);
  }

  async function toggleActive(user: ManagedUser, active: boolean) {
    if (busyId) return;
    setBusyId(user.id);
    const result = await setUserActive(user.id, active);
    setBusyId(null);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setUsers((list) => list.map((u) => (u.id === user.id ? { ...u, active } : u)));
    toast.success(active ? "Pengguna diaktifkan" : "Pengguna dinonaktifkan");
  }

  async function confirmDelete() {
    if (!deleteTarget || busyId) return;
    const target = deleteTarget;

    setBusyId(target.id);
    const result = await deleteUserAccount(target.id);
    setBusyId(null);
    setDeleteOpen(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setUsers((list) => list.filter((u) => u.id !== target.id));
    toast.success("Pengguna berhasil dihapus");
  }

  if (status === "loading") {
    return <p className="py-10 text-center text-sm text-muted">Memuat pengguna...</p>;
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-sm text-foreground">
          Daftar pengguna gagal dimuat. Periksa koneksi internet lalu coba lagi.
        </p>
        <Button
          onClick={() => {
            setStatus("loading");
            setReload((value) => value + 1);
          }}
        >
          Coba lagi
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex justify-end">
          <Button onClick={openAdd}>
            <Plus className="size-4" />
            Tambah Pengguna
          </Button>
        </div>

        <Table>
          <THead>
            <Th>Nama</Th>
            <Th>Username</Th>
            <Th>Peran</Th>
            <Th align="center">Status</Th>
            <Th align="center">Aktif</Th>
            <Th align="center">Aksi</Th>
          </THead>
          <TBody>
            {users.map((u) => {
              const self = u.id === selfId;
              const busy = busyId === u.id;
              return (
                <Tr key={u.id}>
                  <Td>
                    {u.name}
                    {self && <span className="ml-2 text-xs text-muted">(Anda)</span>}
                  </Td>
                  <Td>{u.username}</Td>
                  <Td>{u.role}</Td>
                  <Td align="center">
                    {u.active ? (
                      <Badge>Aktif</Badge>
                    ) : (
                      <Badge variant="solid" color="#9CA3AF">
                        Nonaktif
                      </Badge>
                    )}
                  </Td>
                  <Td align="center">
                    <div className="flex justify-center">
                      <Toggle
                        checked={u.active}
                        disabled={self || busy}
                        onChange={(value) => void toggleActive(u, value)}
                        aria-label={`Status aktif ${u.name}`}
                      />
                    </div>
                  </Td>
                  <Td align="center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        aria-label={`Reset kata sandi ${u.name}`}
                        title="Reset kata sandi"
                        disabled={busy}
                        onClick={() => openPassword(u)}
                        className="flex size-7 items-center justify-center rounded text-primary transition hover:bg-primary-soft disabled:opacity-40"
                      >
                        <KeyRound className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Hapus ${u.name}`}
                        title={self ? "Akun yang sedang dipakai tidak bisa dihapus" : "Hapus pengguna"}
                        disabled={self || busy}
                        onClick={() => askDelete(u)}
                        className="flex size-7 items-center justify-center rounded text-danger transition hover:bg-danger-soft disabled:opacity-40 disabled:hover:bg-transparent"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </Table>

        <p className="text-xs text-muted">
          {users.length} pengguna. Akun yang sedang dipakai tidak bisa dinonaktifkan
          atau dihapus. Pengguna yang dihapus tidak mengubah riwayat transaksi.
        </p>
      </div>

      <AddUserModal
        key={`add-${addKey}`}
        open={addOpen}
        onClose={closeAdd}
        onCreated={(user) => setUsers((list) => [...list, user])}
      />

      <ResetPasswordModal
        key={`password-${passwordKey}`}
        open={passwordOpen}
        onClose={closePassword}
        user={passwordTarget}
      />

      <ConfirmModal
        open={deleteOpen}
        onClose={closeDelete}
        onConfirm={() => void confirmDelete()}
        title="Hapus Pengguna"
        message={`Hapus pengguna "${deleteTarget?.name ?? ""}"? Akunnya tidak bisa dipakai login lagi dan tindakan ini tidak bisa dibatalkan.`}
      />
    </>
  );
}