"use client";

import { useDevAuth } from "./DevAuthProvider";
import { DEV_ROLE_LABELS } from "@/lib/devAuth";
import { UserCog } from "lucide-react";

export default function DevRoleToggle() {
  const { role, cycleRole } = useDevAuth();

  return (
    <button
      onClick={cycleRole}
      className="fixed bottom-20 right-6 z-[9999] flex items-center gap-2 pl-3 pr-4 h-10 rounded-full cursor-pointer transition-all duration-300 hover:scale-105 border border-[var(--color-hairline)]"
      style={{
        background: "color-mix(in srgb, var(--color-void-black) 72%, transparent)",
        backdropFilter: "blur(24px)",
        boxShadow: "var(--shadow-key)",
      }}
      title="Переключить тестовую роль (dev-режим)"
      aria-label="Переключить тестовую роль"
    >
      <UserCog className="w-4 h-4" style={{ color: "var(--color-coral-text)" }} strokeWidth={1.75} />
      <span className="text-xs font-semibold" style={{ color: "var(--color-pure-white)" }}>
        {DEV_ROLE_LABELS[role]}
      </span>
    </button>
  );
}
