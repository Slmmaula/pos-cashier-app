"use client";

import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Product } from "@/lib/types";

function ImageInner({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-surface text-placeholder",
          className,
        )}
      >
        <ImageIcon className="size-8" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}

export function ProductImage({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const src = product.image ?? `/products/${product.code}.jpg`;
  return (
    <ImageInner key={src} src={src} alt={product.name} className={className} />
  );
}
