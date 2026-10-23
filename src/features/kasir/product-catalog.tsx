"use client";

import { useMemo, useState, type Ref } from "react";
import { PackageSearch, Search } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import type { Category, Product } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { useCartStore } from "@/store/cart-store";
import { toast } from "@/store/toast-store";
import { ProductCard } from "./product-card";

type CatalogTab = "semua" | Category;

const TABS: TabItem<CatalogTab>[] = [
  { value: "semua", label: "Semua produk" },
  { value: "Makanan", label: "Makanan" },
  { value: "Minuman", label: "Minuman" },
  { value: "Lainnya", label: "Lainnya" },
];

const CATEGORY_ORDER: Record<Category, number> = {
  Makanan: 0,
  Minuman: 1,
  Lainnya: 2,
};

export function ProductCatalog({
  searchRef,
}: {
  searchRef: Ref<HTMLInputElement>;
}) {
  const products = useAppStore((s) => s.products);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<CatalogTab>("semua");

  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return products
      .filter((p) => p.active)
      .filter((p) => tab === "semua" || p.category === tab)
      .filter(
        (p) =>
          !keyword ||
          p.name.toLowerCase().includes(keyword) ||
          p.code.toLowerCase().includes(keyword),
      )
      .sort((a, b) => CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category]);
  }, [products, query, tab]);

  function handleAdd(product: Product) {
    const added = useCartStore.getState().add(product.id, product.stock);
    if (added) {
      toast.success("Produk berhasil ditambahkan");
    } else {
      toast.error("Stok tidak mencukupi");
    }
  }

  return (
    <div className="@container flex flex-col gap-4">
      <Input
        ref={searchRef}
        placeholder="Cari produk (F2)"
        leftIcon={<Search className="size-4" />}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <Tabs<CatalogTab> items={TABS} value={tab} onChange={setTab} />

      {visible.length === 0 ? (
        <EmptyState icon={PackageSearch} title="Produk tidak ditemukan" />
      ) : (
        <div className="grid grid-cols-2 gap-4 @md:grid-cols-3 @xl:grid-cols-4">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={handleAdd} />
          ))}
        </div>
      )}
    </div>
  );
}
