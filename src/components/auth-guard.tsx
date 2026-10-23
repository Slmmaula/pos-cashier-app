"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useDemoReset } from "@/lib/demo/use-demo-reset";
import { canAccess } from "@/lib/nav";
import { useAppStore } from "@/store/app-store";
import { useAuthStore } from "@/store/auth-store";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const resetDemo = useDemoReset();
  const hydrated = useAppStore((state) => state.hydrated);
  const dataStatus = useAppStore((state) => state.dataStatus);
  const status = useAuthStore((state) => state.status);
  const profile = useAuthStore((state) => state.profile);

  const allowed = canAccess(profile?.role, pathname);

  useEffect(() => {
    if (status === "signed-out") {
      useAppStore.getState().unloadData();
      router.replace("/login");
    } else if (status === "signed-in" && !allowed) {
      router.replace("/kasir");
    }
  }, [status, allowed, router]);

  useEffect(() => {
    if (hydrated && status === "signed-in" && dataStatus === "idle") {
      void useAppStore.getState().loadData();
    }
  }, [hydrated, status, dataStatus]);

  if (!hydrated || status !== "signed-in" || !allowed) {
    return <div className="h-dvh bg-page" />;
  }

  if (dataStatus === "error") {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-page p-6 text-center">
        <p className="max-w-md text-sm text-foreground">
          Data demo tidak dapat dimuat. Coba lagi, atau kembalikan demo ke data
          contoh awal.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => useAppStore.setState({ dataStatus: "idle" })}>
            Coba lagi
          </Button>
          <Button variant="outline" onClick={() => void resetDemo()}>
            Reset demo
          </Button>
        </div>
      </div>
    );
  }

  if (dataStatus !== "ready") {
    return (
      <div className="flex h-dvh items-center justify-center bg-page text-sm text-muted">
        Memuat data...
      </div>
    );
  }

  return <>{children}</>;
}
