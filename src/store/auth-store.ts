import { create } from "zustand";
import { USERNAME_PATTERN, normalizeUsername } from "@/lib/auth";
import { loadDb } from "@/lib/demo/db";
import type { User, UserRole } from "@/lib/types";

const SESSION_KEY = "pos-demo-session";

export type Profile = {
  id: string;
  name: string;
  username: string;
  role: UserRole;
};

type Status = "loading" | "signed-out" | "signed-in";

export type LoginResult =
  | { ok: true }
  | { ok: false; error: string; reason?: "inactive" };

type AuthState = {
  status: Status;
  profile: Profile | null;
  init: () => Promise<void>;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
};

const INVALID = "Username atau password salah";
const INACTIVE =
  "Akun Anda telah dinonaktifkan. Hubungi Owner untuk mengaktifkan kembali akun Anda.";

function readSession(): string | null {
  try {
    return window.localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function writeSession(id: string | null): void {
  try {
    if (id) window.localStorage.setItem(SESSION_KEY, id);
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {}
}

function toProfile(user: User): Profile {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
  };
}

let initPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set) => ({
  status: "loading",
  profile: null,

  init: () => {
    if (initPromise) return initPromise;

    initPromise = (async () => {
      const id = readSession();
      const user = id ? loadDb().users.find((u) => u.id === id) : undefined;

      if (user && user.active) {
        set({ status: "signed-in", profile: toProfile(user) });
      } else {
        if (id) writeSession(null);
        set({ status: "signed-out", profile: null });
      }
    })();

    return initPromise;
  },

  login: async (username, password) => {
    const name = normalizeUsername(username);
    if (!USERNAME_PATTERN.test(name)) return { ok: false, error: INVALID };

    const user = loadDb().users.find((u) => u.username === name);

    if (!user || user.password !== password) {
      return { ok: false, error: INVALID };
    }
    if (!user.active) {
      return { ok: false, error: INACTIVE, reason: "inactive" };
    }

    writeSession(user.id);
    set({ status: "signed-in", profile: toProfile(user) });
    return { ok: true };
  },

  logout: async () => {
    writeSession(null);
    set({ status: "signed-out", profile: null });
  },
}));
