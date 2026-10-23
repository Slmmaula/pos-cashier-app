"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { formatRupiah } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ProductImage } from "./product-image";

type ProductCardProps = {
  product: Product;
  onAdd: (product: Product) => void;
};

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const low = product.stock < product.minStock;
  const empty = product.stock <= 0;

  return (
    <motion.div
      whileHover={empty ? undefined : { y: -2 }}
      whileTap={empty ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.15 }}
      onClick={() => {
        if (!empty) onAdd(product);
      }}
      className={cn(
        "flex flex-col overflow-hidden rounded-card border border-line bg-card shadow-card transition-colors",
        empty
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:border-primary/40",
      )}
    >
      <div className="relative aspect-square w-full">
        <ProductImage product={product} className="size-full" />
        <Badge variant="overlay" className="absolute right-2 top-2">
          {product.category}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-0.5 p-3">
        <p className="line-clamp-2 min-h-9 text-[13px] font-bold leading-[18px] text-foreground">
          {product.name}
        </p>
        <p className="text-[11px] text-placeholder">{product.code}</p>

        <div className="mt-2 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-primary">
              {formatRupiah(product.sellPrice)}
            </p>
            <p
              className={cn(
                "text-[11px]",
                low || empty ? "text-danger" : "text-muted",
              )}
            >
              Stok: {product.stock}
            </p>
          </div>
          <button
            type="button"
            disabled={empty}
            aria-label={`Tambah ${product.name} ke keranjang`}
            onClick={(event) => {
              event.stopPropagation();
              onAdd(product);
            }}
            className="flex size-8 shrink-0 items-center justify-center rounded-control bg-primary text-white transition hover:bg-primary-hover active:scale-95 disabled:cursor-not-allowed disabled:bg-disabled focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
