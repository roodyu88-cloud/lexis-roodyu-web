import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import EditPresetForm from "./EditPresetForm";
import Link from "next/link";

export const revalidate = 0;

export default async function EditPresetPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect(`/api/auth/signin?callbackUrl=/presets/${resolvedParams.id}/edit`);
  }

  const preset = await prisma.preset.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!preset) {
    return notFound();
  }

  const currentUserId = (session.user as any).id;
  const currentUserRole = (session.user as any).role || "user";
  const isAuthor = preset.discordId === currentUserId;
  const isModOrAdmin = currentUserRole === "admin" || currentUserRole === "developer" || currentUserRole === "moderator" || currentUserId === "546005790864048140";

  // Access Control check
  if (!isAuthor && !isModOrAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="glass-card p-8 border-red-500/20 text-center max-w-md w-full relative overflow-hidden rounded-2xl shadow-2xl">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <span className="text-4xl block mb-4">🚫</span>
          <h1 className="text-2xl font-bold text-white mb-2">Доступ ограничен</h1>
          <p className="text-gray-400 mb-6 text-sm">Вы не являетесь автором этого пресета и не имеете прав модератора для его изменения.</p>
          <Link href={`/presets/${resolvedParams.id}`} className="btn-secondary text-sm !py-2.5">
            Вернуться назад
          </Link>
        </div>
      </main>
    );
  }

  // Fetch available projects/servers
  const servers = await prisma.serverProject.findMany({
    orderBy: { name: "asc" },
    include: { servers: true }
  });

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
