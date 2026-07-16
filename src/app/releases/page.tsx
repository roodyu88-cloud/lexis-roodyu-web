"use client";

// PLACEHOLDER-DB (2026-07-15): unused while DB call below is placeholdered — restore with the query.
// import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { useDevSession } from "@/app/components/DevAuthProvider";
import ReleaseAdminActions from "./ReleaseAdminActions";
import { Plus, ShieldCheck, Download } from "lucide-react";

export default function ReleasesPage() {
  const { data: session } = useDevSession();
  const isAdmin = (session?.user as any)?.role === "admin" || (session?.user as any)?.role === "developer";

  // PLACEHOLDER-DB (2026-07-15): DATABASE_URL absent in this dev env, real query crashes SSR.
  // Original: const releases = await prisma.release.findMany({ orderBy: { createdAt: "desc" } });
  const releases = [
    { id: "ph-release-1", version: "v2.1.0", title: "Биндер и стабильность", description: "Добавлен биндер горячих клавиш.\nИсправлены баги оверлея.", downloadUrl: null, fileData: null, fileName: null, virusTotalUrl: "https://virustotal.com", createdAt: new Date("2026-07-01") },
    { id: "ph-release-2", version: "v2.0.0", title: "Большое обновление", description: "Новый ИИ-ассистент и тренажер экзаменов.", downloadUrl: null, fileData: null, fileName: null, virusTotalUrl: null, createdAt: new Date("2026-05-15") },
  ];

  return (
    <div className="min-h-screen p-6 md:p-12 relative overflow-hidden z-0">
      <div className="fixed top-20 left-[10%] w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none -z-10" style={{ background: "rgba(124, 108, 240, 0.08)" }} aria-hidden="true" />
      <div className="fixed bottom-20 right-[10%] w-[400px] h-[400px] rounded-full blur-[130px] pointer-events-none -z-10" style={{ background: "rgba(124, 108, 240, 0.05)" }} aria-hidden="true" />

      <div className="max-w-4xl mx-auto z-10 relative">
        <header className="mb-16 text-center relative">
          <h1 className="text-heading-lg font-bold mb-4 tracking-[var(--tracking-heading-lg)] text-[var(--color-pure-white)]">
            История обновлений
          </h1>
          <p className="text-body-lg max-w-xl mx-auto text-[var(--color-ash)]">
            Скачивайте новые версии, следите за изменениями и будьте в курсе последних обновлений.
          </p>

          {isAdmin && (
            <div className="mt-8">
              <Link
                href="/admin/releases"
                className="rc-btn-ghost inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Создать новый релиз
              </Link>
            </div>
          )}
        </header>

        {releases.length === 0 ? (
          <div className="rc-card-edge text-center p-12" style={{ background: "var(--color-ink)" }}>
            <p className="text-xl" style={{ color: "var(--color-ash)" }}>Пока нет опубликованных обновлений.</p>
          </div>
        ) : (
          <div className="space-y-8 md:space-y-10">
            {releases.map((release, index) => (
              <div
                key={release.id}
                className="rc-card-edge relative p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8"
                style={{ background: "var(--color-ink)" }}
              >
                {/* Version Column */}
                <div className="md:w-1/4 shrink-0 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider"
                      style={
                        index === 0
                          ? { background: "var(--color-coral-pulse)", color: "var(--color-on-coral)" }
                          : { background: "var(--color-graphite)", color: "var(--color-ash)" }
                      }
                    >
                      {index === 0 ? "Последняя версия" : "Старая версия"}
                    </span>
                  </div>
                  <h2 className="text-heading-sm font-bold tracking-tight font-data" style={{ color: "var(--color-pure-white)" }}>{release.version}</h2>
                  <p className="text-sm mt-1 font-medium font-data" style={{ color: "var(--color-smoke)" }}>
                    {new Intl.DateTimeFormat("ru-RU", {
                      dateStyle: "medium",
                    }).format(release.createdAt)}
                  </p>

                  {isAdmin && <ReleaseAdminActions releaseId={release.id} />}
                </div>

                {/* Content Column */}
                <div className="md:w-3/4 flex flex-col h-full">
                  <h3 className="text-heading-sm font-bold mb-4" style={{ color: "var(--color-pure-white)" }}>{release.title}</h3>
                  <div className="max-w-none mb-8 whitespace-pre-wrap flex-grow font-medium leading-relaxed text-body" style={{ color: "var(--color-ash)" }}>
                    {release.description}
                  </div>

                  <div className="mt-auto flex flex-wrap gap-4">
                    <a
                      href={`/api/releases/download/${release.id}`}
                      className="rc-btn inline-flex items-center justify-center gap-2"
                      style={{ padding: "12px 24px" }}
                    >
                      <Download className="w-5 h-5" />
                      Скачать {release.version}
                    </a>

                    {release.virusTotalUrl && (
                      <a
                        href={release.virusTotalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10"
                      >
                        <ShieldCheck className="w-5 h-5" /> Проверка VirusTotal
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
