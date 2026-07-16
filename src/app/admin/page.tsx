"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDevSession } from "@/app/components/DevAuthProvider";
// PLACEHOLDER-DB (2026-07-15): unused while DB calls below are placeholdered — restore with the query.
// import { prisma } from "@/lib/prisma";
import AdminDashboard from "./AdminDashboard";
import { ShieldCheck } from "lucide-react";

export default function AdminPage() {
  const { data: session, status } = useDevSession();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  const discordId = session?.user ? (session.user as any).id : null;
  const role = session?.user ? (session.user as any).role : null;
  const isAuthorized = role === "admin" || role === "developer" || discordId === "546005790864048140";

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && !isAuthorized)) {
      router.push("/");
    } else if (status === "authenticated" && isAuthorized) {
      setChecked(true);
    }
  }, [status, isAuthorized, router]);

  if (!checked) {
    return <div className="min-h-screen flex items-center justify-center text-sm animate-pulse" style={{ color: "var(--color-ash)" }}>Проверка доступа...</div>;
  }

  // PLACEHOLDER-DB (2026-07-15): DATABASE_URL absent in this dev env, real queries crash SSR.
  // Original:
  // const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  // const presets = await prisma.preset.findMany({ orderBy: { createdAt: "desc" } });
  // const servers = await prisma.serverProject.findMany({ orderBy: { createdAt: "desc" }, include: { servers: true } });
  // const settings = await prisma.appSetting.findMany();
  // const promocodes = await prisma.promocode.findMany({ orderBy: { createdAt: "desc" } });
  // const allPrompts = await prisma.aIPromptLog.findMany({ select: { discordId: true, createdAt: true }});
  // const allExams = await prisma.examSession.findMany({ select: { creatorId: true, createdAt: true }});
  const users = [
    { id: "ph-user-1", discordId: "111111111111111111", username: "Ivan Petrov", avatar: null, role: "admin", badges: JSON.stringify(["Creator", "Staff"]), canUpload: true, isPremium: true, premiumUntil: null, isBanned: false, banReason: null, createdAt: new Date("2026-01-01") },
    { id: "ph-user-2", discordId: "222222222222222222", username: "Anna Volkova", avatar: null, role: "user", badges: JSON.stringify(["ActivePresetser"]), canUpload: true, isPremium: false, premiumUntil: null, isBanned: false, banReason: null, createdAt: new Date("2026-02-15") },
  ];
  const presets = [
    { id: "ph-preset-1", name: "Уголовный кодекс", description: "Полный УК сервера Majestic", author: "Ivan Petrov", discordId: "111111111111111111", data: "[]", downloads: 482, isVerified: true, serverProjectId: "ph-project-1", serverId: "ph-server-1", createdAt: new Date("2026-06-01") },
  ];
  const servers = [
    { id: "ph-project-1", name: "Majestic RP", iconUrl: "/img/Verified.png", discordRoleId: null, webhookUrl: null, createdAt: new Date("2026-01-01"), servers: [{ id: "ph-server-1", name: "Boston", serverProjectId: "ph-project-1", createdAt: new Date("2026-01-01") }] },
  ];
  const settingsObj = { discordUrl: "https://dsc.gg/lexis" };
  const promocodes = [
    { id: "ph-promo-1", code: "LEXIS30", days: 30, uses: 4, maxUses: 50, createdAt: new Date("2026-05-01") },
  ];

  // Format badges array for users
  const formattedUsers = users.map(u => ({
    ...u,
    badges: JSON.parse(u.badges || "[]") as string[],
  }));

  // Fetch stats raw data
  const allPrompts = [
    { discordId: "111111111111111111", createdAt: new Date("2026-07-14") },
    { discordId: "222222222222222222", createdAt: new Date("2026-07-09") },
  ];
  const allExams = [
    { creatorId: "111111111111111111", createdAt: new Date("2026-07-14") },
  ];

  // Helper for date filtering
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  const stats = {
    global: {
      ai: {
        day: allPrompts.filter(p => p.createdAt >= oneDayAgo).length,
        month: allPrompts.filter(p => p.createdAt >= oneMonthAgo).length,
        year: allPrompts.filter(p => p.createdAt >= oneYearAgo).length,
        total: allPrompts.length
      },
      exams: {
        day: allExams.filter(e => e.createdAt >= oneDayAgo).length,
        month: allExams.filter(e => e.createdAt >= oneMonthAgo).length,
        year: allExams.filter(e => e.createdAt >= oneYearAgo).length,
        total: allExams.length
      }
    },
    users: {} as Record<string, { ai: any, exams: any }>
  };

  formattedUsers.forEach(u => {
    const userPrompts = allPrompts.filter(p => p.discordId === u.discordId);
    const userExams = allExams.filter(e => e.creatorId === u.discordId);
    
    stats.users[u.discordId] = {
      ai: {
        day: userPrompts.filter(p => p.createdAt >= oneDayAgo).length,
        month: userPrompts.filter(p => p.createdAt >= oneMonthAgo).length,
        year: userPrompts.filter(p => p.createdAt >= oneYearAgo).length,
        total: userPrompts.length
      },
      exams: {
        day: userExams.filter(e => e.createdAt >= oneDayAgo).length,
        month: userExams.filter(e => e.createdAt >= oneMonthAgo).length,
        year: userExams.filter(e => e.createdAt >= oneYearAgo).length,
        total: userExams.length
      }
    };
  });

  return (
    <main className="min-h-screen p-4 sm:p-8 max-w-6xl mx-auto bg-[var(--color-void-black)]">
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "var(--color-obsidian)", border: "1px solid var(--color-hairline)", color: "var(--color-coral-text)" }}
        >
          <ShieldCheck className="w-6 h-6" strokeWidth={2} />
        </div>
        <h1 className="text-heading font-extrabold tracking-tight text-[var(--color-pure-white)]">Панель управления Lexis</h1>
      </div>
      <AdminDashboard initialUsers={formattedUsers} initialPresets={presets} initialServers={servers} initialSettings={settingsObj} initialPromocodes={promocodes} initialStats={stats} />
    </main>
  );
}
