import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { headers } from "next/headers";
import DeletePresetButton from "./DeletePresetButton";

export const revalidate = 0;

export default async function PresetDetails({ params }: { params: Promise<{ id: string }> }) {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const xForwardedProto = headersList.get("x-forwarded-proto") || "";
  const protocol = xForwardedProto.split(",")[0].trim() || (host.includes("localhost") ? "http" : "https");
  const domain = `${protocol}://${host}`;
  const resolvedParams = await params;
  const preset = await prisma.preset.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!preset) {
    return notFound();
  }

  // Fetch author user details for badges
  const authorUser = preset.discordId ? await prisma.user.findUnique({
    where: { discordId: preset.discordId }
  }) : null;
  const authorBadges = authorUser ? JSON.parse(authorUser.badges || "[]") as string[] : [];

  const BADGE_FILES: Record<string, string> = {
    Staff: "Staff.png",
    BugHunter: "BugHunter.png",
    ActivePresetser: "ActivePresetser.png",
    Moderator: "Moderator.png",
    Partnered: "Partnered.png"
  };

  const BADGE_LABELS: Record<string, string> = {
    Staff: "Staff",
    BugHunter: "Bug Hunter",
    ActivePresetser: "Активный автор пресетов",
    Moderator: "Модератор Lexis",
    Partnered: "Партнер Lexis"
  };

  // Get current user session & permission checks
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user ? (session.user as any).id : null;
  const currentUserRole = session?.user ? (session.user as any).role : "user";

  const isAuthor = preset.discordId === currentUserId;
  const isModOrAdmin = currentUserRole === "admin" || currentUserRole === "developer" || currentUserRole === "moderator" || currentUserId === "546005790864048140";
  const hasDeletePermission = isAuthor || isModOrAdmin;
  const hasEditPermission = isAuthor || isModOrAdmin;

  // Parse the JSON data safely
  let data;
  try {
    data = JSON.parse(preset.data);
  } catch (e) {
    data = [];
  }

  // Calculate stats
  const categoryCount = Array.isArray(data) ? data.length : (data?.data ? data.data.length : 0);
  let articleCount = 0;
  
  const rawArray = Array.isArray(data) ? data : (data?.data || []);
  rawArray.forEach((cat: any) => {
    if (cat.articles && Array.isArray(cat.articles)) {
      articleCount += cat.articles.length;
    }
  });

  // Protocol scheme for direct opening
  const directLink = `lexis://import?url=${domain}/api/download/${preset.id}`;

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <Link href="/presets" className="text-[#5865F2] hover:underline mb-8 inline-block">
        ← Назад к базе
      </Link>
      
      <div className="glass-card p-8 mb-8 relative">
        {preset.isVerified && (
          <div className="absolute top-8 right-8 group/tooltip">
            <img src="/img/Verified.png" alt="Verified" className="h-10 w-auto" />
            <span className="absolute bottom-full right-0 mb-1.5 hidden group-hover/tooltip:block bg-[#121318] border border-white/10 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shadow-2xl pointer-events-none whitespace-nowrap z-30">
              Верифицированный пресет
            </span>
          </div>
        )}
        <h1 className="text-3xl font-bold text-white mb-2 pr-12">{preset.name}</h1>
        <p className="text-gray-400 mb-6">{preset.description || "Нет описания"}</p>
        
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="bg-white/5 rounded-md px-4 py-2 border border-white/10">
            <span className="text-gray-500 text-sm block">Автор</span>
            <span className="text-white font-semibold flex items-center gap-2">
              {preset.author}
              {authorBadges.map(b => {
                const file = BADGE_FILES[b];
                const label = BADGE_LABELS[b];
                if (!file) return null;
                return (
                  <span key={b} className="relative group/tooltip inline-block align-middle ml-1">
                    <img 
                      src={`/img/${file}`} 
                      alt={label} 
                      className="h-4.5 w-auto cursor-help"
                    />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/tooltip:block bg-[#121318] border border-white/10 text-white text-[10px] font-semibold px-2 py-1 rounded-md shadow-2xl pointer-events-none whitespace-nowrap z-30">
                      {label}
                    </span>
                  </span>
                );
              })}
            </span>
          </div>
          <div className="bg-white/5 rounded-md px-4 py-2 border border-white/10">
            <span className="text-gray-500 text-sm block">Категорий</span>
            <span className="text-white font-semibold">{categoryCount}</span>
          </div>
          <div className="bg-white/5 rounded-md px-4 py-2 border border-white/10">
            <span className="text-gray-500 text-sm block">Статей</span>
            <span className="text-white font-semibold">{articleCount}</span>
          </div>
          <div className="bg-white/5 rounded-md px-4 py-2 border border-white/10">
            <span className="text-gray-500 text-sm block">Скачиваний</span>
            <span className="text-white font-semibold">{preset.downloads}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <a href={`/api/download/${preset.id}`} className="btn-primary">
              Скачать .json
            </a>
            <a href={directLink} className="btn-secondary">
              🚀 Открыть в Lexis
            </a>
            {hasEditPermission && (
              <Link href={`/presets/${preset.id}/edit`} className="btn-secondary flex items-center gap-1.5 !py-2.5">
                ✏️ Редактировать
              </Link>
            )}
          </div>
          
          {hasDeletePermission && (
            <DeletePresetButton 
              presetId={preset.id} 
              presetName={preset.name} 
              isAuthor={isAuthor} 
              isModOrAdmin={isModOrAdmin} 
            />
          )}
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">Предпросмотр структуры</h2>
      <div className="space-y-4">
        {rawArray.map((cat: any, idx: number) => (
          <div key={idx} className="glass-card p-6">
            <h3 className="text-xl font-bold text-[#5865F2] mb-4">{cat.name || "Без названия"}</h3>
            <div className="space-y-2 pl-4 border-l-2 border-white/10">
              {cat.articles && cat.articles.length > 0 ? (
                cat.articles.map((art: any, i: number) => (
                  <div key={i} className="text-gray-300">
                    <span className="font-semibold text-white">{art.title}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 italic">Нет статей</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

