"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Moon,
  ShoppingCart,
  Sun,
  SunMoon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { NAV_ITEMS, canAccess } from "@/lib/nav";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const role = useAuthStore((state) => state.profile?.role);

  const items = NAV_ITEMS.filter((item) => canAccess(role, item.href));

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  async function handleLogout() {
    useCartStore.getState().clear();
    await useAuthStore.getState().logout();
    router.replace("/login");
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex h-full shrink-0 flex-col overflow-hidden border-r border-line bg-card"
    >
      <div
        className={cn(
          "flex h-[76px] shrink-0 items-center border-b border-line",
          collapsed ? "justify-center px-3" : "justify-between px-4",
        )}
      >
        {!collapsed && (
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <ShoppingCart className="size-5" />
            </div>
            <div className="min-w-0 whitespace-nowrap">
              <p className="text-base font-bold leading-5 text-primary">
                Pos System
              </p>
              <p className="text-[11px] leading-4 text-muted">Sistem kasir</p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Perluas sidebar" : "Sempitkan sidebar"}
          className="flex size-8 shrink-0 items-center justify-center rounded-control bg-surface text-foreground transition hover:bg-line focus-visible:outline-2 focus-visible:outline-primary"
        >
          {collapsed ? (
            <ChevronsRight className="size-4" />
          ) : (
            <ChevronsLeft className="size-4" />
          )}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-10 items-center gap-3 whitespace-nowrap rounded-control text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-primary",
                collapsed ? "justify-center px-0" : "px-3",
                active
                  ? "bg-primary-soft text-primary"
                  : "text-foreground hover:bg-surface",
              )}
            >
              <Icon className="size-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t border-line p-3">
        <div
          className={cn(
            "flex h-10 items-center whitespace-nowrap",
            collapsed ? "justify-center" : "justify-between pl-3",
          )}
        >
          {!collapsed && (
            <span className="flex items-center gap-3 text-sm font-medium text-foreground">
              <SunMoon className="size-[18px] shrink-0" />
              Mode Tampilan
            </span>
          )}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Ganti mode terang/gelap"
            title="Ganti mode terang/gelap"
            className="flex size-8 items-center justify-center rounded-control bg-surface text-foreground transition hover:bg-line focus-visible:outline-2 focus-visible:outline-primary"
          >
            <Moon className="size-4 dark:hidden" />
            <Sun className="hidden size-4 dark:block" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "Keluar" : undefined}
          aria-label="Keluar"
          className={cn(
            "flex h-10 items-center gap-3 whitespace-nowrap rounded-control text-sm font-medium text-danger transition hover:bg-danger-soft focus-visible:outline-2 focus-visible:outline-danger",
            collapsed ? "justify-center px-0" : "px-3",
          )}
        >
          <LogOut className="size-[18px] shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </motion.aside>
  );
}
