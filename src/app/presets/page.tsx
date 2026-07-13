import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PresetsList from "./PresetsList";

export const revalidate = 0; // Disable cache for this page

export default async function PresetsPage() {
  const presets = await prisma.preset.findMany({
    orderBy: { createdAt: "desc" }
  });

  const servers = await prisma.serverProject.findMany({
    orderBy: { name: "asc" },
    include: { servers: true }
  });

  // Fetch profiles of preset authors in one optimized query
  const discordIds = Array.from(new Set(presets.map(p => p.discordId).filter(Boolean))) as string[];
  const users = await prisma.user.findMany({
    where: { discordId: { in: discordIds } }
  });

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
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold glow-text">База пресетов</h1>
        <Link href="/upload" className="btn-primary">
          + Загрузить свой
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

