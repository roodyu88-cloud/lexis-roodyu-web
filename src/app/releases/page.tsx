import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import ReleaseAdminActions from "./ReleaseAdminActions";

export default async function ReleasesPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as any)?.role === "admin" || (session?.user as any)?.role === "developer";

  const releases = await prisma.release.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen text-white p-6 md:p-12 relative overflow-hidden z-0">
      <div className="max-w-4xl mx-auto z-10 relative">
        <header className="mb-16 text-center relative">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-[#00F0FF] to-purple-500 mb-4 tracking-tight">
            История обновлений
          </h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto">
            Скачивайте новые версии, следите за изменениями и будьте в курсе последних обновлений.
          </p>
          
          {isAdmin && (
            <div className="mt-8">
              <Link 
                href="/admin/releases"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
              >
                <span>➕</span> Создать новый релиз
              </Link>
            </div>
          )}
        </header>

        {releases.length === 0 ? (
          <div className="text-center p-12 bg-[#121215]/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-xl">
            <p className="text-gray-400 text-xl">Пока нет опубликованных обновлений.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {releases.map((release, index) => (
              <div 
                key={release.id} 
                className="relative bg-[#121215]/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl transition-all duration-300 hover:border-white/20 hover:bg-white/5 flex flex-col md:flex-row gap-8"
              >
                {/* Version Column */}
                <div className="md:w-1/4 shrink-0 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold rounded-full uppercase tracking-wider">
                      {index === 0 ? "Последняя версия" : "Старая версия"}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">{release.version}</h2>
                  <p className="text-gray-400 text-sm mt-1 font-medium">
                    {new Intl.DateTimeFormat("ru-RU", {
                      dateStyle: "medium",
                    }).format(release.createdAt)}
                  </p>
                  
                  {isAdmin && <ReleaseAdminActions releaseId={release.id} />}
                </div>

                {/* Content Column */}
                <div className="md:w-3/4 flex flex-col h-full">
                  <h3 className="text-2xl font-bold text-gray-100 mb-4">{release.title}</h3>
                  <div className="prose prose-invert max-w-none text-gray-300 mb-8 whitespace-pre-wrap flex-grow font-medium leading-relaxed">
                    {release.description}
                  </div>
                  
                  <div className="mt-auto flex flex-wrap gap-4">
                    <a
                      href={`/api/releases/download/${release.id}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Скачать {release.version}
                    </a>
                    
                    {release.virusTotalUrl && (
                      <a
                        href={release.virusTotalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        🛡️ Проверка VirusTotal
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
