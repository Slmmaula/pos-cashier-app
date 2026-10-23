"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { useAppStore } from "@/store/app-store";
import { useAuthStore } from "@/store/auth-store";
import { Clock } from "./clock";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Header() {
  const pathname = usePathname();
  const profile = useAuthStore((state) => state.profile);
  const storeName = useAppStore((state) => state.settings.storeName);
  const current = NAV_ITEMS.find((item) => pathname.startsWith(item.href));
  const subtitle =
    current?.href === "/kasir"
      ? storeName.trim() || "Informasi toko belum diisi"
      : current?.subtitle;

  return (
    <header className="flex shrink-0 items-center justify-between gap-4 px-6 py-5">
      <div className="min-w-0">
        <h1 className="truncate text-[22px] font-bold leading-7 text-foreground">
          {current?.title ?? "Pos System"}
        </h1>
        <p className="truncate text-[13px] text-muted">{subtitle}</p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          aria-label="Notifikasi"
          className="flex size-10 items-center justify-center rounded-control bg-surface text-primary transition hover:bg-line focus-visible:outline-2 focus-visible:outline-primary"
        >
          <Bell className="size-5" />
        </button>

        <div className="rounded-control bg-surface px-3 py-1.5">
          <p className="text-xs font-bold leading-4 text-foreground">Waktu</p>
          <p className="whitespace-nowrap text-[11px] leading-4 text-muted tabular-nums">
            <Clock />
          </p>
        </div>

        <div className="flex items-center gap-2.5 rounded-control bg-surface px-3 py-1.5">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            {profile ? initials(profile.name) : ""}
          </div>
          <div>
            <p className="text-xs font-bold leading-4 text-foreground">
              {profile?.name}
            </p>
            <p className="text-[11px] leading-4 text-muted">{profile?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
