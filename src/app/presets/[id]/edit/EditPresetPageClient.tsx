"use client";

// PLACEHOLDER-DB (2026-07-15): unused while DB calls below are placeholdered — restore with the query.
// import { prisma } from "@/lib/prisma";
import { useDevSession } from "@/app/components/DevAuthProvider";
import EditPresetForm from "./EditPresetForm";
import Link from "next/link";
import { Ban } from "lucide-react";
import LoginRequiredCard from "@/app/components/LoginRequiredCard";

export default function EditPresetPageClient({ id }: { id: string }) {
  const { data: session, status } = useDevSession();

  if (status === "loading") return null;

  if (!session?.user) {
    return <LoginRequiredCard message="Чтобы редактировать пресет, нужно войти." />;
  }

  // PLACEHOLDER-DB (2026-07-15): DATABASE_URL absent in this dev env, real query crashes SSR.
  // Original:
  // const preset = await prisma.preset.findUnique({ where: { id } });
  // if (!preset) return notFound();
  const preset = {
    id, name: "Уголовный кодекс (плейсхолдер)", description: "Placeholder-данные для превью без БД.",
    author: "roodyu", discordId: "111111111111111111", data: "[]", downloads: 482, isVerified: true,
    serverProjectId: "ph-project-1", serverId: "ph-server-1", createdAt: new Date("2026-06-01"),
  };

  const currentUserId = (session.user as any).id;
  const currentUserRole = (session.user as any).role || "user";
  const isAuthor = preset.discordId === currentUserId;
  const isModOrAdmin = currentUserRole === "admin" || currentUserRole === "developer" || currentUserRole === "moderator" || currentUserId === "546005790864048140";

  // Access Control check
  if (!isAuthor && !isModOrAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div
          className="rc-card-edge text-center max-w-md w-full relative overflow-hidden"
          style={{ borderColor: "rgba(239, 68, 68, 0.2)", background: "var(--color-ink)", padding: "32px" }}
        >
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ban className="w-8 h-8" />
          </div>
          <h1 className="text-heading-sm font-bold text-[var(--color-pure-white)] mb-2">Доступ ограничен</h1>
          <p className="text-[var(--color-ash)] mb-6 text-sm">Вы не являетесь автором этого пресета и не имеете прав модератора для его изменения.</p>
          <Link href={`/presets/${id}`} className="rc-btn-ghost text-sm">
            Вернуться назад
          </Link>
        </div>
      </main>
    );
  }

  // PLACEHOLDER-DB (2026-07-15): original —
  // const servers = await prisma.serverProject.findMany({ orderBy: { name: "asc" }, include: { servers: true } });
  const servers = [
    { id: "ph-project-1", name: "Majestic RP", iconUrl: "/img/Verified.png", discordRoleId: null, webhookUrl: null, createdAt: new Date("2026-01-01"), servers: [{ id: "ph-server-1", name: "Boston" }, { id: "ph-server-2", name: "Atlanta" }] },
    { id: "ph-project-2", name: "GTA 5 RP", iconUrl: "/img/Verified.png", discordRoleId: null, webhookUrl: null, createdAt: new Date("2026-01-01"), servers: [] },
  ];

  const formattedPreset = {
    id: preset.id,
    name: preset.name,
    description: preset.description,
    serverProjectId: preset.serverProjectId,
    serverId: preset.serverId
  };

  const formattedServers = servers.map(s => ({
    id: s.id,
    name: s.name,
    iconUrl: s.iconUrl,
    servers: (s.servers || []).map((nested: any) => ({
      id: nested.id,
      name: nested.name
    }))
  }));

  return (
    <main className="min-h-screen p-8 pt-24">
      <EditPresetForm preset={formattedPreset} servers={formattedServers} />
    </main>
  );
}
