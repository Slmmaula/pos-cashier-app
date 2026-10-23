import { USERNAME_PATTERN, normalizeUsername } from "@/lib/auth";
import { loadDb, transact } from "@/lib/demo/db";
import { uid } from "@/lib/id";
import type { UserRole } from "@/lib/types";
import { useAuthStore } from "@/store/auth-store";
import type { DbResult } from "./products";

export type ManagedUser = {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  active: boolean;
};

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72;
const NAME_MAX = 60;

const NOT_FOUND = "Pengguna tidak ditemukan.";
const SELF_DEACTIVATE = "Akun yang sedang Anda pakai tidak bisa dinonaktifkan.";
const SELF_DELETE = "Akun yang sedang Anda pakai tidak bisa dihapus.";

function selfId(): string | undefined {
  return useAuthStore.getState().profile?.id;
}

function passwordError(password: string): string | null {
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    return `Kata sandi ${PASSWORD_MIN}-${PASSWORD_MAX} karakter.`;
  }
  return null;
}

export async function fetchUsers(): Promise<ManagedUser[]> {
  return loadDb().users.map((u) => ({
    id: u.id,
    name: u.name,
    username: u.username,
    role: u.role,
    active: u.active,
  }));
}

export type NewUserInput = {
  name: string;
  username: string;
  password: string;
  role: UserRole;
};

export async function createUserAccount(
  input: NewUserInput,
): Promise<DbResult<ManagedUser>> {
  const name = input.name.trim();
  const username = normalizeUsername(input.username);

  if (!name || name.length > NAME_MAX) {
    return {
      ok: false,
      error: `Nama wajib diisi (maksimal ${NAME_MAX} karakter).`,
    };
  }
  if (!USERNAME_PATTERN.test(username)) {
    return {
      ok: false,
      error:
        "Username 3-30 karakter: huruf kecil, angka, titik, garis bawah, atau strip.",
    };
  }
  const weak = passwordError(input.password);
  if (weak) return { ok: false, error: weak };
  if (input.role !== "Owner" && input.role !== "Kasir") {
    return { ok: false, error: "Peran tidak valid." };
  }

  return transact<ManagedUser>((db) => {
    if (db.users.some((u) => u.username === username)) {
      return { ok: false, error: "Username sudah digunakan." };
    }

    const created = {
      id: uid(),
      name,
      username,
      password: input.password,
      role: input.role,
      active: true,
    };
    db.users.push(created);

    return {
      ok: true,
      data: {
        id: created.id,
        name: created.name,
        username: created.username,
        role: created.role,
        active: created.active,
      },
    };
  });
}

export async function setUserActive(
  id: string,
  active: boolean,
): Promise<DbResult<null>> {
  if (!active && id === selfId()) {
    return { ok: false, error: SELF_DEACTIVATE };
  }

  return transact<null>((db) => {
    const target = db.users.find((u) => u.id === id);
    if (!target) return { ok: false, error: NOT_FOUND };
    target.active = active;
    return { ok: true, data: null };
  });
}

export async function resetUserPassword(
  id: string,
  password: string,
): Promise<DbResult<null>> {
  const weak = passwordError(password);
  if (weak) return { ok: false, error: weak };

  return transact<null>((db) => {
    const target = db.users.find((u) => u.id === id);
    if (!target) return { ok: false, error: NOT_FOUND };
    target.password = password;
    return { ok: true, data: null };
  });
}

export async function deleteUserAccount(id: string): Promise<DbResult<null>> {
  if (id === selfId()) return { ok: false, error: SELF_DELETE };

  return transact<null>((db) => {
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) return { ok: false, error: NOT_FOUND };
    db.users.splice(index, 1);
    return { ok: true, data: null };
  });
}
