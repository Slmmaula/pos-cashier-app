import {
  ChartColumn,
  History,
  Package,
  Settings,
  ShoppingCart,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "./types";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  ownerOnly?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/kasir",
    label: "Kasir",
    icon: ShoppingCart,
    title: "Kasir",
    subtitle: "Transaksi penjualan",
  },
  {
    href: "/barang",
    label: "Barang & Stok",
    icon: Package,
    title: "Daftar Barang",
    subtitle: "Kelola data barang & inventori",
  },
  {
    href: "/riwayat",
    label: "Riwayat Transaksi",
    icon: History,
    title: "Riwayat Transaksi",
    subtitle: "Lihat dan kelola riwayat penjualan",
  },
  {
    href: "/laporan",
    label: "Laporan",
    icon: ChartColumn,
    title: "Laporan",
    subtitle: "Analisa keuangan dan performa toko",
    ownerOnly: true,
  },
  {
    href: "/pengeluaran",
    label: "Pengeluaran",
    icon: Wallet,
    title: "Pengeluaran Toko",
    subtitle: "Catat dan kelola pengeluaran operasional",
    ownerOnly: true,
  },
  {
    href: "/pengaturan",
    label: "Pengaturan",
    icon: Settings,
    title: "Pengaturan Toko",
    subtitle: "Konfigurasi sistem dan preferensi toko",
    ownerOnly: true,
  },
];

export function canAccess(
  role: UserRole | undefined,
  pathname: string,
): boolean {
  if (!role) return false;
  const item = NAV_ITEMS.find((entry) => pathname.startsWith(entry.href));
  if (!item) return true;
  return !item.ownerOnly || role === "Owner";
}
