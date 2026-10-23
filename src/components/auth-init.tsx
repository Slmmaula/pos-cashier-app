"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";

export function AuthInit() {
  useEffect(() => {
    void useAuthStore.getState().init();
  }, []);

  return null;
}
