import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminDashboard from "./AdminDashboard";

export const revalidate = 0;

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/");
  }

  const discordId = (session.user as any).id;
  const role = (session.user as any).role;

  // Authorize only admin/developer role or the hardcoded discord ID
  if (role !== "admin" && role !== "developer" && discordId !== "546005790864048140") {
    redirect("/");
  }

  // Fetch initial data
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const presets = await prisma.preset.findMany({
    orderBy: { createdAt: "desc" },
  });

  const servers = await prisma.serverProject.findMany({
    orderBy: { createdAt: "desc" },
    include: { servers: true }
  });

  const settings = await prisma.appSetting.findMany();
  const settingsObj = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});

  const promocodes = await prisma.promocode.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Format badges array for users
  const formattedUsers = users.map(u => ({
    ...u,
    badges: JSON.parse(u.badges || "[]") as string[],
  }));

  // Fetch stats raw data
  const allPrompts = await prisma.aIPromptLog.findMany({ select: { discordId: true, createdAt: true }});
  const allExams = await prisma.examSession.findMany({ select: { creatorId: true, createdAt: true }});

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
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-8 glow-text tracking-tight">Панель управления Lexis</h1>
      <AdminDashboard initialUsers={formattedUsers} initialPresets={presets} initialServers={servers} initialSettings={settingsObj} initialPromocodes={promocodes} initialStats={stats} />
    </main>
  );
}
