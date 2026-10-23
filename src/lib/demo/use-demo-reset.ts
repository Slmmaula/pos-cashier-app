"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { resetDb } from "@/lib/demo/db";
import { useAppStore } from "@/store/app-store";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { toast } from "@/store/toast-store";

export function useDemoReset() {
  const router = useRouter();

  return useCallback(async () => {
    const db = resetDb();
    useCartStore.getState().clear();

    const profileId = useAuthStore.getState().profile?.id;
    const stillValid = db.users.some((u) => u.id === profileId && u.active);

    useAppStore.getState().unloadData();

    if (!stillValid) {
      await useAuthStore.getState().logout();
      router.replace("/login");
    }

    toast.success("Data demo dikembalikan ke awal");
  }, [router]);
}
