"use client";

import { useState } from "react";
import { Database, Receipt, Store, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { DataTab } from "./data-tab";
import { ProfileTab } from "./profile-tab";
import { ReceiptTab } from "./receipt-tab";
import { UsersTab } from "./users-tab";

type SettingsTab = "profil" | "struk" | "pengguna" | "data";

const TABS: TabItem<SettingsTab>[] = [
  { value: "profil", label: "Profil Toko", icon: Store },
  { value: "struk", label: "Struk & Pajak", icon: Receipt },
  { value: "pengguna", label: "Pengguna", icon: Users },
  { value: "data", label: "Data", icon: Database },
];

export function PengaturanPage() {
  const [tab, setTab] = useState<SettingsTab>("profil");

  return (
    <Card className="flex flex-col gap-4">
      <Tabs<SettingsTab>
        variant="soft"
        items={TABS}
        value={tab}
        onChange={setTab}
      />

      <div>
        <div hidden={tab !== "profil"}>
          <ProfileTab />
        </div>
        <div hidden={tab !== "struk"}>
          <ReceiptTab />
        </div>
        <div hidden={tab !== "pengguna"}>
          <UsersTab />
        </div>
        <div hidden={tab !== "data"}>
          <DataTab />
        </div>
      </div>
    </Card>
  );
}
