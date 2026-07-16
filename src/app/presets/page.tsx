// PLACEHOLDER-DB (2026-07-15): unused while DB calls below are placeholdered — restore with the query.
// import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import PresetsList from "./PresetsList";

// PLACEHOLDER-DB (2026-07-15): mock data standing in for the DB while DATABASE_URL is unset locally.
const PLACEHOLDER_PRESETS = [
  { id: "ph-preset-1", name: "Уголовный кодекс", description: "Полный УК сервера Majestic", author: "Ivan Petrov", discordId: "111111111111111111", data: "[]", downloads: 482, isVerified: true, serverProjectId: "ph-project-1", serverId: "ph-server-1", createdAt: new Date("2026-06-01") },
  { id: "ph-preset-2", name: "Кодекс ПДД", description: "Правила дорожного движения", author: "Anna Volkova", discordId: "222222222222222222", data: "[]", downloads: 210, isVerified: false, serverProjectId: "ph-project-1", serverId: "ph-server-2", createdAt: new Date("2026-06-10") },
  { id: "ph-preset-3", name: "Административный кодекс", description: null, author: "Server Staff", discordId: "111111111111111111", data: "[]", downloads: 96, isVerified: true, serverProjectId: "ph-project-2", serverId: null, createdAt: new Date("2026-06-18") },
];
const PLACEHOLDER_SERVERS = [
  { id: "ph-project-1", name: "Majestic RP", iconUrl: "/img/Verified.png", discordRoleId: null, webhookUrl: null, createdAt: new Date("2026-01-01"), servers: [{ id: "ph-server-1", name: "Boston", serverProjectId: "ph-project-1", createdAt: new Date("2026-01-01") }, { id: "ph-server-2", name: "Atlanta", serverProjectId: "ph-project-1", createdAt: new Date("2026-01-01") }] },
  { id: "ph-project-2", name: "GTA 5 RP", iconUrl: "/img/Verified.png", discordRoleId: null, webhookUrl: null, createdAt: new Date("2026-01-01"), servers: [] },
];
const PLACEHOLDER_USERS = [
  { id: "ph-user-1", discordId: "111111111111111111", username: "Ivan Petrov", avatar: null, role: "user", badges: JSON.stringify(["Creator", "Staff"]), canUpload: true, isPremium: true, premiumUntil: null, isBanned: false, banReason: null, createdAt: new Date("2026-01-01") },
  { id: "ph-user-2", discordId: "222222222222222222", username: "Anna Volkova", avatar: null, role: "user", badges: JSON.stringify(["ActivePresetser"]), canUpload: true, isPremium: false, premiumUntil: null, isBanned: false, banReason: null, createdAt: new Date("2026-01-01") },
];

export default async function PresetsPage() {
  // PLACEHOLDER-DB (2026-07-15): DATABASE_URL absent in this dev env, real queries crash SSR.
  // Original:
  // const presets = await prisma.preset.findMany({ where: { author: { not: "Lexis AI" } }, orderBy: { createdAt: "desc" } });
  // const servers = await prisma.serverProject.findMany({ orderBy: { name: "asc" }, include: { servers: true } });
  // const discordIds = Array.from(new Set(presets.map(p => p.discordId).filter(Boolean))) as string[];
  // const users = await prisma.user.findMany({ where: { discordId: { in: discordIds } } });
  const presets = PLACEHOLDER_PRESETS;
  const servers = PLACEHOLDER_SERVERS;
  const discordIds = Array.from(new Set(presets.map(p => p.discordId).filter(Boolean))) as string[];
  const users = PLACEHOLDER_USERS.filter(u => discordIds.includes(u.discordId));

  const userMap: Record<string, { role: string; badges: string[] }> = {};
  users.forEach(u => {
    userMap[u.discordId] = {
      role: u.role,
      badges: JSON.parse(u.badges || "[]") as string[]
    };
  });

  const BADGE_FILES: Record<string, string> = {
    Creator: "Creator.png",
    Staff: "Staff.png",
    BugHunter: "BugHunter.png",
    ActivePresetser: "ActivePresetser.png",
    Moderator: "Moderator.png",
    Partnered: "Partnered.png"
  };

  const BADGE_LABELS: Record<string, string> = {
    Creator: "Создатель",
    Staff: "Стафф",
    BugHunter: "Bug Hunter",
    ActivePresetser: "Активный автор пресетов",
    Moderator: "Модератор Lexis",
    Partnered: "Партнер Lexis"
  };

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10 relative">
        <h1 className="text-heading font-bold text-[var(--color-pure-white)]">База пресетов</h1>
        <Link href="/upload" className="rc-btn flex items-center gap-2">
          <Plus className="w-4 h-4" /> Загрузить свой
        </Link>
      </div>

      <PresetsList
        presets={presets}
        servers={servers}
        userMap={userMap}
        badgeFiles={BADGE_FILES}
        badgeLabels={BADGE_LABELS}
      />
    </main>
  );
}

